# Simple schema validator for CSV datasets
import sys, csv

def validate(path, expected_cols:int):
    with open(path, newline='', encoding='utf-8') as f:
        r = csv.reader(f)
        header = next(r)
        if len(header) != expected_cols:
            print(f"[FAIL] {path}: expected {expected_cols} columns, found {len(header)}")
            return 1
        for i, row in enumerate(r, start=2):
            if len(row) != expected_cols:
                print(f"[FAIL] {path}: row {i} has {len(row)} columns")
                return 1
    print(f"[OK] {path}")
    return 0

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python validate_csv.py <csv_path> <expected_col_count>")
        sys.exit(2)
    sys.exit(validate(sys.argv[1], int(sys.argv[2])))
