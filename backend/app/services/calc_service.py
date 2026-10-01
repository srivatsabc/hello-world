# Date: October 1, 2026
# Name: Sri
# Desc: The add and subtract logic. Both the REST routes and the AI agent's
#       tools call these same functions, so there is one source of truth for
#       the arithmetic.
from __future__ import annotations


def add_numbers(first_number: float, second_number: float) -> float:
    return first_number + second_number


def subtract_numbers(first_number: float, second_number: float) -> float:
    return first_number - second_number
