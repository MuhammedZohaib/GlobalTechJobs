import json

def remove_duplicates_from_json(input_file, output_file):
    try:
        # Load the JSON data from the file with UTF-8 encoding
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Ensure the JSON data is a list
        if not isinstance(data, list):
            print("The JSON file must contain a list of objects.")
            return

        # Remove duplicates by converting dictionaries to tuples (immutable and hashable)
        unique_data = list({json.dumps(item, sort_keys=True): item for item in data}.values())

        # Write the cleaned data to the output file with UTF-8 encoding
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(unique_data, f, indent=4, ensure_ascii=False)

        print(f"Duplicates removed. Cleaned data saved to '{output_file}'.")

    except Exception as e:
        print(f"An error occurred: {e}")

# Replace 'input.json' and 'output.json' with your file paths
input_file = 'Companies.json'
output_file = 'output.json'
remove_duplicates_from_json(input_file, output_file)
