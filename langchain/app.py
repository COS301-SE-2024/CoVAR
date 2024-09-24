from flask import Flask, request, jsonify
from langchain_core.prompts.chat import ChatPromptTemplate
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv, find_dotenv
import jwt
import traceback
import os
import openai
import re

app = Flask(__name__)

# Load the public key from the .pem file with UTF-8 encoding
try:
    with open('public.pem', 'r', encoding='utf-8') as pem_file:
        public_key = pem_file.read()
    with open('private.pem', 'r', encoding='utf-8') as pem_file:
        private_key = pem_file.read()
    print(f"PEM files loaded successfully. Public key: {public_key[:30]}...")
except FileNotFoundError:
    print("PEM file not found. Please check the file path.")
    public_key, private_key = None, None
except Exception as e:
    print(f"Error loading PEM file: {e}")
    public_key, private_key = None, None

def verify_jwt(token):
    try:
        # Decode the token using the public key
        print(f"Received token: {token}")
        decoded_token = jwt.decode(token, public_key, algorithms=["RS256"])
        return decoded_token
    except jwt.ExpiredSignatureError:
        return {'error': 'Token has expired'}, 401
    except jwt.InvalidTokenError:
        return {"error": f"Invalid token: {token}"}, 403

def test_jwt():
    user = {"username": "test_user"}
    token = jwt.encode(user, private_key, algorithm="RS256")
    print(f"Generated JWT: {token}")
    decoded = verify_jwt(token)
    return jsonify({"token": token, "decoded": decoded})

def extract_ips(chain_prompt):
    # Regular expression to match all IP addresses in the chain_prompt
    ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
    
    # Find all IP addresses in the chain_prompt
    ips = re.findall(ip_pattern, chain_prompt)
    
    modified_prompt = re.sub(ip_pattern, "[IP_ADDRESS]", chain_prompt)
    
    return modified_prompt, ips  
# Function to reinsert all IPs into the result
def reinsert_ips(result, ips):
    # Replace the "[IP_ADDRESS]" placeholder with each IP in order
    for ip in ips:
        result = result.replace("[IP_ADDRESS]", ip, 1)  
    return result

@app.route('/unmatchedRecomendations', methods=['POST'])
def unmatched_recommendation():
    data = request.json

    if not data:
        return jsonify({'error': 'No data received'}), 400

    # Retrieve the first available key-value pair from data
    key, value = next(iter(data.items()))
    chain_prompt = value

    print("Running unmatched recommendation")
    template = """Vulnerability {chain_prompt}\nYou are a cyber security specialist. Give an insight to if this is a valid concern for the system. Keep it short and concise."""
    prompt = ChatPromptTemplate.from_template(template)

    try:
        load_dotenv(find_dotenv())
        model_type = os.environ['MODEL_TYPE']
        
        if model_type == 'openai':
            openai.api_key = os.environ['API_KEY']
            model = ChatOpenAI()
        
        elif model_type == 'ollama':
            model = ChatOllama(model="llama3.1:8b", base_url="http://host.docker.internal:11434")
        
        elif model_type == 'gemini':
            if "GOOGLE_API_KEY" not in os.environ:
                os.environ["GOOGLE_API_KEY"] = os.environ['API_KEY']
            model = ChatGoogleGenerativeAI(model="gemini-pro")
        
        else:
            raise ValueError(f"Invalid model type: {model_type}")
        
        chain = prompt | model
        result = chain.invoke({"chain_prompt": chain_prompt})
        print(f"Model invocation result: {result}")
        return jsonify({'result': result.content})
    
    except Exception as e:
        print(f"Error invoking model: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Error invoking model: {e}'}), 500

@app.route('/topVulChain', methods=['POST'])
def run_test():
    #test_jwt()
    # Extract token from the Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Authorization token is missing'}), 401
    
    # Ensure the token follows "Bearer <token>" format
    if not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Invalid Authorization header format'}), 400

    token = auth_header.split(" ")[1]  # Extract the token part
    verification_result = verify_jwt(token)
    
    if isinstance(verification_result, tuple):
        # If the verification returns an error, return it to the client
        return jsonify(verification_result[0]), verification_result[1]
    
    # Proceed with the chain prompt logic if the token is valid
    data = request.json
    chain_prompt = data.get('chain_prompt', '')

    if not chain_prompt:
        return jsonify({'error': 'chain_prompt is required'}), 400

    print("Running test")
    print(chain_prompt)
    modified_prompt, ip_address = extract_ips(chain_prompt)
    print(f"modified_prompt: {modified_prompt}")
    template = """Vulnerability {chain_prompt}\nYou are a cyber security specialist. Give an insight into why this is a so concerning and a relate it to the correlating cvss score. Keep it short and concise."""
    prompt = ChatPromptTemplate.from_template(template)

    try:
        load_dotenv(find_dotenv())
        model_type = os.environ['MODEL_TYPE']
        
        if model_type == 'openai':
            openai.api_key = os.environ['API_KEY']
            model = ChatOpenAI()
        
        elif model_type == 'ollama':
            model = ChatOllama(model="llama3.1:8b", base_url="http://host.docker.internal:11434")
        
        elif model_type == 'gemini':
            if "GOOGLE_API_KEY" not in os.environ:
                os.environ["GOOGLE_API_KEY"] = os.environ['API_KEY']
            model = ChatGoogleGenerativeAI(model="gemini-pro")
        
        else:
            raise ValueError(f"Invalid model type: {model_type}")
        
        chain = prompt | model
        result = chain.invoke({"chain_prompt": modified_prompt})
        print(f"Model invocation result: {result}")
        
        final_result = reinsert_ips(result.content, ip_address)
        return jsonify({'result': final_result})
    
    except Exception as e:
        print(f"Error invoking model: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Error invoking model: {e}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000, debug=True)
