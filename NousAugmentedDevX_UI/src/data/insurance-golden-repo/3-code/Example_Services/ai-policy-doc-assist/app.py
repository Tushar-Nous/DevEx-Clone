# stub service
from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route('/docs/summarize', methods=['POST'])
def summarize():
    txt = (request.json or {}).get("text","")
    return jsonify({
        "summary":[
            "Increased liability limit to 1M",
            "Added cyber endorsement CYB-001"
        ],
        "citations":["Sec 2.1", "End CYB-001"],
        "model_version":"doc-sum-v1.0"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081)
