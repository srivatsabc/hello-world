# Date: October 1, 2026
# Name: Sri
# Desc: One shared logging setup so every module logs through
#       logging.getLogger("hello_world.<module>") and noisy third-party
#       libraries stay quiet unless something goes wrong.
from __future__ import annotations

import logging


def setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    for noisy in ("httpx", "httpcore", "urllib3", "openai"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
