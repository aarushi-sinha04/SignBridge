import h5py
import json
import os

def inspect_model(model_path):
    print(f"\nInspecting model: {model_path}")
    try:
        with h5py.File(model_path, 'r') as f:
            print("Model configuration:")
            if 'model_config' in f.attrs:
                config = json.loads(f.attrs['model_config'])
                print(json.dumps(config, indent=2))
            else:
                print("No model configuration found")
            
            print("\nModel layers:")
            if 'model_weights' in f:
                for layer_name in f['model_weights']:
                    print(f"- {layer_name}")
                    layer = f['model_weights'][layer_name]
                    if 'vars' in layer:
                        print(f"  Variables: {list(layer['vars'].keys())}")
    except Exception as e:
        print(f"Error inspecting model: {str(e)}")

def main():
    # Get the absolute path to the model directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(os.path.dirname(current_dir))
    model_dir = os.path.join(root_dir, 'model')

    # Inspect both models
    inspect_model(os.path.join(model_dir, 'asl_alphabet_model.h5'))
    inspect_model(os.path.join(model_dir, 'asl_lstm_model.h5'))

if __name__ == '__main__':
    main() 