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

## Deploy Live (Render)

This repository now includes `render.yaml` for simple deployment.

1. Push your latest code to GitHub.
2. Sign in to Render and choose New + > Blueprint.
3. Connect your GitHub account and select this repository.
4. Render will detect `render.yaml` and create the web service automatically.
5. Wait for the build to complete, then open the generated `.onrender.com` URL.

If you prefer manual setup on Render instead of Blueprint:

- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn app:app`

## Deploy Live (Hugging Face Spaces)

This project includes a `Dockerfile`, so deploy it as a Docker Space.

1. Create a new Space on Hugging Face.
2. Choose SDK: Docker.
3. Keep Space visibility Public or Private as you prefer.
4. Create the Space.

Then push your code to the Space repo:

```bash
git add Dockerfile .dockerignore README.md
git commit -m "chore: add Hugging Face Spaces deployment"
git push

git remote add hf https://huggingface.co/spaces/<your-username>/<your-space-name>
git push hf main
```

If the `hf` remote already exists:

```bash
git remote set-url hf https://huggingface.co/spaces/<your-username>/<your-space-name>
git push hf main
```

After the push, Hugging Face will build the Docker image and give you a live URL.

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
