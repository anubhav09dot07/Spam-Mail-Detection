from pathlib import Path
import os

import pandas as pd
from flask import Flask, jsonify, render_template, request
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "dataset.csv"


def load_training_data() -> tuple[pd.Series, pd.Series]:
    df = pd.read_csv(DATASET_PATH)
    drop_candidates = ["Unnamed: 2", "Unnamed: 3", "Unnamed: 4"]
    df = df.drop(columns=[column for column in drop_candidates if column in df.columns])
    df["Category"] = df["Category"].map({"spam": 1, "ham": 0})
    df = df.dropna(subset=["Category", "Message"])
    messages = df["Message"].astype(str)
    labels = df["Category"].astype(int)
    return messages, labels


def build_model() -> Pipeline:
    messages, labels = load_training_data()
    model = Pipeline(
        [
            ("tfidf", TfidfVectorizer(stop_words="english", lowercase=True)),
            ("classifier", LogisticRegression(max_iter=1000)),
        ]
    )
    model.fit(messages, labels)
    return model


def build_dashboard_metrics() -> dict:
    messages, labels = load_training_data()
    train_messages, test_messages, train_labels, test_labels = train_test_split(
        messages,
        labels,
        test_size=0.2,
        random_state=3,
        stratify=labels,
    )

    evaluation_model = Pipeline(
        [
            ("tfidf", TfidfVectorizer(stop_words="english", lowercase=True)),
            ("classifier", LogisticRegression(max_iter=1000)),
        ]
    )
    evaluation_model.fit(train_messages, train_labels)
    predictions = evaluation_model.predict(test_messages)

    lengths = messages.str.split().str.len()
    class_counts = labels.value_counts().sort_index()
    confusion = confusion_matrix(test_labels, predictions, labels=[0, 1])

    return {
        "dataset": {
            "total": int(len(messages)),
            "ham": int(class_counts.get(0, 0)),
            "spam": int(class_counts.get(1, 0)),
            "train": int(len(train_messages)),
            "test": int(len(test_messages)),
        },
        "metrics": {
            "accuracy": round(accuracy_score(test_labels, predictions) * 100, 2),
            "precision": round(precision_score(test_labels, predictions) * 100, 2),
            "recall": round(recall_score(test_labels, predictions) * 100, 2),
            "f1": round(f1_score(test_labels, predictions) * 100, 2),
        },
        "class_balance": {
            "ham": int(class_counts.get(0, 0)),
            "spam": int(class_counts.get(1, 0)),
        },
        "average_length": {
            "ham": round(float(lengths[labels == 0].mean()), 1),
            "spam": round(float(lengths[labels == 1].mean()), 1),
        },
        "confusion_matrix": {
            "labels": ["Ham", "Spam"],
            "values": confusion.tolist(),
        },
    }


app = Flask(__name__, template_folder="html", static_folder="static")
model = build_model()
dashboard_metrics = build_dashboard_metrics()


@app.get("/")
def index() -> str:
    return render_template("index.html")


@app.get("/api/metrics")
def metrics() -> tuple[dict, int]:
    return jsonify(dashboard_metrics)


@app.post("/predict")
def predict() -> tuple[dict, int]:
    payload = request.get_json(silent=True) or {}
    email_text = str(payload.get("email", "")).strip()

    if not email_text:
        return jsonify({"error": "Please provide an email message."}), 400

    prediction = model.predict([email_text])[0]
    probability = float(model.predict_proba([email_text])[0][prediction])
    label = "spam" if prediction == 1 else "ham"

    return jsonify({"label": label, "confidence": round(probability * 100, 2)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(debug=True, host="127.0.0.1", port=port)
