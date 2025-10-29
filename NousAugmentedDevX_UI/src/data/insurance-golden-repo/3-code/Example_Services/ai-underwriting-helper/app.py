# stub service
from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route('/underwriting/signals', methods=['POST'])
def signals():
    sub = request.json or {}
    # TODO: enrichment + model call
    return jsonify({
        "decision":"refer",
        "reasons":["New venture", "Prior loss in 12m"],
        "data_refs":["years_in_business", "loss_count_12m"],
        "model_version":"uw-signals-v1.0"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
