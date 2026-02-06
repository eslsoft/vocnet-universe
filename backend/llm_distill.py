#!/usr/bin/env python3
"""
VocNet Universe - AI Knowledge Distillation Script (V2 Optimized)
- Added: Word filtering, Deduplication, ETA calculation, and Auto-retry.
"""
import json
import sys
import argparse
import time
import os
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from datetime import datetime, timedelta

try:
    from openai import OpenAI
except ImportError:
    print("Error: 'openai' package not found. Run 'pip install openai' first.")
    sys.exit(1)

# Relationship types optimized for human learning and memory association
RELATION_TYPES = [
    "synonym", "antonym", "category", "attribute", 
    "action", "context", "component", "consequence"
]

PROMPT_TEMPLATE = """As an expert English pedagogue, provide the 10 most powerful semantic associations for the word '{word}' to help a student deeply internalize its meaning and usage.

Think beyond simple definitions. Focus on vivid imagery, logical connections, and lexical contrast.

For each association, provide:
1. The target word (a single, clear English word).
2. The relationship type strictly from this list: {rel_types}.

Return ONLY a JSON object with a single key "associations" whose value is a JSON array of objects with 'target' and 'type' keys.
"""

def sanitize_associations(word, associations):
    """Clean and deduplicate associations from LLM."""
    if not isinstance(associations, list):
        return []
    
    seen_targets = set()
    clean_list = []
    
    for item in associations:
        target = item.get('target', '').strip().lower()
        rel_type = item.get('type', '').strip().lower()
        
        # 1. Skip if target is empty, same as source word, or not a valid type
        if not target or target == word or rel_type not in RELATION_TYPES:
            continue
            
        # 2. Deduplicate targets within the same word
        if target in seen_targets:
            continue
            
        seen_targets.add(target)
        clean_list.append({"target": target, "type": rel_type})
        
    return clean_list

def distill_word(client, model, word, retries=2):
    prompt = PROMPT_TEMPLATE.format(word=word, rel_types=", ".join(RELATION_TYPES))
    
    for attempt in range(retries + 1):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a precise JSON generator. Output must be valid JSON and nothing else.",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.6,
            )

            raw_content = response.choices[0].message.content or ""
            if not raw_content:
                continue
                
            data = json.loads(raw_content)
            
            # Extract list from various possible JSON structures
            if isinstance(data, list):
                raw_list = data
            elif isinstance(data, dict):
                raw_list = data.get("associations") or next(
                    (v for v in data.values() if isinstance(v, list)), []
                )
            else:
                raw_list = []
                
            return sanitize_associations(word, raw_list)
            
        except Exception as e:
            if attempt < retries:
                time.sleep(2) # Wait before retry
                continue
            print(f"\n[Error] Failed to process '{word}' after {retries} retries: {e}")
    return None

def main():
    parser = argparse.ArgumentParser(description="Distill vocabulary knowledge using Llama 3.1 V2")
    parser.add_argument("--wordlist", default="backend/data/wordlist.txt", help="Path to word list")
    parser.add_argument("--out", default="backend/data/llm_semantic_graph.json", help="Output JSON path")
    parser.add_argument(
        "--provider",
        choices=["ollama", "openai", "openrouter"],
        default="ollama",
        help="LLM provider (default: ollama)",
    )
    parser.add_argument("--model", default=None, help="Model name (provider-specific)")
    parser.add_argument("--workers", type=int, default=4, help="Parallel requests (default: 4)")
    parser.add_argument("--limit", type=int, default=None, help="Number of words to process")
    parser.add_argument("--resume", action="store_true", help="Resume from existing output")
    args = parser.parse_args()

    # Load words
    wordlist_path = Path(args.wordlist)
    if not wordlist_path.exists():
        print(f"Error: Wordlist not found at {args.wordlist}")
        sys.exit(1)

    all_words = [w.strip().lower() for w in wordlist_path.read_text().splitlines() if w.strip()]
    
    # FILTERING: Skip single letters and common noise
    words = [w for w in all_words if len(w) > 1]
    if args.limit:
        words = words[:args.limit]

    results = {}
    if args.resume and Path(args.out).exists():
        try:
            results = json.loads(Path(args.out).read_text())
            print(f"Resuming: Loaded {len(results)} existing entries.")
        except Exception as e:
            print(f"Error loading resume file: {e}")

    default_models = {
        "ollama": "llama3.1",
        "openai": "gpt-4o-mini",
        "openrouter": "meta-llama/llama-3.1-70b-instruct",
    }
    model = args.model or default_models[args.provider]

    if args.provider == "ollama":
        base_url = "http://localhost:11434/v1"
        api_key = "ollama"
        headers = None
    elif args.provider == "openrouter":
        api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("Error: OPENROUTER_API_KEY (or OPENAI_API_KEY) is required for OpenRouter.")
            sys.exit(1)
        headers = {}
        referer = os.getenv("OPENROUTER_REFERER")
        title = os.getenv("OPENROUTER_TITLE")
        if referer:
            headers["HTTP-Referer"] = referer
        if title:
            headers["X-Title"] = title
        base_url = "https://openrouter.ai/api/v1"
    else:
        base_url = None
        api_key = None
        headers = None

    thread_local = threading.local()

    def get_client():
        if not hasattr(thread_local, "client"):
            if base_url:
                thread_local.client = OpenAI(
                    base_url=base_url, api_key=api_key, default_headers=headers
                )
            else:
                thread_local.client = OpenAI()
        return thread_local.client

    print(
        f"Starting distillation V2 with {args.provider}:{model} (workers={args.workers})..."
    )
    
    count = 0
    start_time = time.time()
    pending_words = [w for w in words if w not in results]
    total_to_do = len(pending_words)

    def process_word(word):
        associations = distill_word(get_client(), model, word)
        return word, associations

    try:
        with ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
            futures = {executor.submit(process_word, w): w for w in pending_words}
            completed = 0

            for future in as_completed(futures):
                word, associations = future.result()
                completed += 1

                elapsed = time.time() - start_time
                avg_time = elapsed / max(1, completed)
                eta_seconds = avg_time * (total_to_do - completed)
                eta_str = (
                    str(timedelta(seconds=int(eta_seconds)))
                    if completed > 0
                    else "--:--:--"
                )

                print(
                    f"[{completed}/{total_to_do}] '{word}' | ETA: {eta_str} | Avg: {avg_time:.1f}s ",
                    end="\r",
                )
                sys.stdout.flush()

                if associations:
                    results[word] = associations
                    count += 1
                    if count % 5 == 0:
                        Path(args.out).write_text(json.dumps(results, indent=2))

    except KeyboardInterrupt:
        print("\n\nInterrupted! Saving progress...")
    
    # Final save
    Path(args.out).write_text(json.dumps(results, indent=2))
    
    total_elapsed = time.time() - start_time
    print(f"\n\nDone! Total words in DB: {len(results)}")
    print(f"New words added: {count}")
    print(f"Output saved to: {args.out}")

if __name__ == "__main__":
    main()
