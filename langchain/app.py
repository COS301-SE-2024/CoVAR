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

app = Flask(__name__)

# Load the public key from the .pem file
try:
    with open('public.pem', 'r') as pem_file:
        public_key = pem_file.read()
    print(f"PEM file loaded successfully. Public key: {public_key[:30]}...")  # Print the first 30 characters for verification
except FileNotFoundError:
    print("PEM file not found. Please check the file path.")
    public_key = None
except Exception as e:
    print(f"Error loading PEM file: {e}")
    public_key = None

def verify_jwt(token):
    try:
        # Decode the token using the public key
        print(f"Received token: {public_key}")
        decoded_token = jwt.decode(token, public_key, algorithms=["RS256"])
        return decoded_token
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

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
    data = request.json
    chain_prompt = data.get('chain_prompt', '')

    if not chain_prompt:
        return jsonify({'error': 'chain_prompt is required'}), 400

    print("Running test")
    template = """Vulnerability {chain_prompt}\nYou are a cyber security specialist. Give an insight into which of these vulnerabilities is the most concerning. Keep it short and concise."""
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000, debug=True)
