from flask import Flask, request, jsonify
from langchain_core.prompts.chat import ChatPromptTemplate
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv, find_dotenv

import requests

app = Flask(__name__)

@app.route('/run_test', methods=['POST'])
def run_test():
    print("Running test")
    template = """Question {question}\nAnswer Let's think step by step."""
    prompt = ChatPromptTemplate.from_template(template)

    # Check if service is running on host machine
    #try:
    #   response = requests.get("http://host.docker.internal:11434")
    #    response.raise_for_status()
    #    print("Service is running")
    #except requests.exceptions.RequestException as e:
    #    print(f"Service is not running: {e}")
    #    return jsonify({'error': 'Ollama service is not running or inaccessible'}), 500

    try:
        load_dotenv(find_dotenv())
        model_type = os.environ['MODEL_TYPE']
        if(model_type == 'openai'):
            model = ChatOpenAI()
        elif(model_type == 'ollama'):
            model = ChatOllama(model="llama3.1:8b", base_url="http://host.docker.internal:11434")
        else:
            raise ValueError(f"Invalid model type: {model_type}")
        chain = prompt | model
        result = chain.invoke({"question": "What are CVE's and should issues be stored by that category in networks?"})
        print(f"Model invocation result: {result}")
        return jsonify({'result': result.content})
    except Exception as e:
        print(f"Error invoking model: {e}")
        return jsonify({'error': f'Error invoking model: {e}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000, debug=True)
