# from flask import Flask, request, jsonify
# import pickle

# app = Flask(__name__)

# # # with open("log_reg_model.pkl", "rb") as f:
# # #     model = pickle.load(f)

# # # with open("tf_vectorizer.pkl", "rb") as f:
# # #     vectorizer = pickle.load(f)

# with open("final_tokenizer.pkl", "rb") as f:
#     tokenizer = pickle.load(f)

# with open("final_model.pkl", "rb") as g:
#     model_new = pickle.load(g)

# # @app.route("/predict", methods=["POST"])
# # def predict():
# #     data = request.json

# #     news_text = data.get("news", "")

# #     if not news_text:
# #         return jsonify({"error": "No news text provided"})

# #    text_seq = tokenizer.texts_to_sequences([news_text])

    
# #     pred = model_new.predict(text_vector)[0]
# #     prob = model_new.predict_proba(text_vector)[0]

# #     return jsonify({
# #         "prediction": "true" if pred == 1 else "false",
# #         "probability": float(max(prob))
# #     })

# # if __name__ == "__main__":
# #     app.run(port=5000, debug=True)

# def predict():
#     data = request.json

#     news_text = data.get("news", "")

#     if not news_text:
#         return jsonify({"error": "No news text provided"})

#     text_seq = tokenizer.texts_to_sequences([news_text])

#     from tensorflow.keras.preprocessing.sequence import pad_sequences
#     text_vector = pad_sequences(text_seq, maxlen=100)

#     pred = model_new.predict(text_vector)[0]
#     prob = model_new.predict(text_vector)[0]

#     return jsonify({
#         "prediction": "true" if pred == 1 else "false",
#         "probability": float(max(prob))
#     })

from flask import Flask, request, jsonify
import pickle
from tensorflow.keras.preprocessing.sequence import pad_sequences

app = Flask(__name__)

import re

def clean_text(text):
    # Lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r"http\S+|www\S+", "", text)

    # Remove HTML tags
    text = re.sub(r"<.*?>", "", text)

    # Remove special characters (keep alphabets + numbers)
    text = re.sub(r"[^a-z0-9\s]", "", text)

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text).strip()

    return text

# with open("log_reg_model.pkl", "rb") as f:
#     model = pickle.load(f)

# with open("tf_vectorizer.pkl", "rb") as f:
#     vectorizer = pickle.load(f)

with open("LSTM_Tokenizer.pkl", "rb") as f:
    tokenizer = pickle.load(f)

with open("LSTM_Model.pkl", "rb") as g:
    model_new = pickle.load(g)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    news_text = data.get("news", "")

    if not news_text:
        return jsonify({"error": "No news text provided"})

    news_text1 = clean_text(news_text)  # Clean the input text
    text_seq = tokenizer.texts_to_sequences([news_text1])  # Convert cleaned text to sequences
    text_vector = pad_sequences(text_seq, maxlen=100)

    pred_prob = model_new.predict(text_vector)[0][0]  # Get the probability for the positive class (binary classification)

    print(f"Predicted probability: {pred_prob}")
    prediction = "true" if pred_prob > 0.5 else "false"
    probability = float(pred_prob)

    return jsonify({
        "prediction": prediction,
        "probability": probability
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)