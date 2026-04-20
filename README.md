# Spam Mail Detection

A Flask-based spam email classifier that uses TF-IDF features and Logistic Regression to predict whether a message is spam or ham.

## Features

- Web interface for entering email text and checking predictions.
- REST API endpoint for spam/ham prediction.
- Dashboard metrics endpoint with model evaluation stats.
- Uses `dataset.csv` for training and evaluation.

## Tech Stack

- Python
- Flask
- pandas
- scikit-learn

## Project Structure

```text
.
├── app.py
├── dataset.csv
├── requirements.txt
├── README.md
├── Spam Email Detection.ipynb
├── html/
│   └── index.html
└── static/
		├── app.js
		└── style.css
```

## Setup

1. Clone the repository:

```bash
git clone https://github.com/anubhav09dot07/Spam-Mail-Detection.git
cd Spam-Mail-Detection
```

2. Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Run the App

```bash
python app.py
```

Open your browser at:

```text
http://127.0.0.1:5000
```

## API Endpoints

### POST `/predict`

Predict whether an email is spam or ham.

Request body:

```json
{
	"email": "Congratulations! You have won a free gift."
}
```

Response:

```json
{
	"label": "spam",
	"confidence": 97.21
}
```

### GET `/api/metrics`

Returns dataset statistics, model metrics, class balance, average message length, and confusion matrix.

## Notes

- Model training happens when the app starts.
- Make sure `dataset.csv` is present in the project root.

## License

This project is for educational purposes.
