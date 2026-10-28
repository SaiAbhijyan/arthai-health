"""NPI check digit (Luhn with the 80840 prefix, per CMS NPI standard)."""

from __future__ import annotations


def npi_is_valid(npi: str) -> bool:
    if len(npi) != 10 or not npi.isascii() or not npi.isdigit():
        return False
    digits = [int(c) for c in "80840" + npi[:9]]
    total = 0
    for i, d in enumerate(reversed(digits)):
        if i % 2 == 0:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    return (10 - total % 10) % 10 == int(npi[9])
