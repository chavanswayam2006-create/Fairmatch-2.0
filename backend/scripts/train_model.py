import os
import json
import numpy as np
import pandas as pd
import xgboost as xgb

def train_xgboost_matcher(csv_path: str = None, output_model_path: str = None):
    """Train XGBoost candidate ranking model from pairwise features dataset."""
    print("Initializing XGBoost Re-ranker Model Training...")
    
    if output_model_path is None:
        output_model_path = os.path.join(os.path.dirname(__file__), "..", "models", "xgboost_matcher.json")

    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)

    if csv_path and os.path.exists(csv_path):
        print(f"Loading training dataset from {csv_path}...")
        df = pd.read_csv(csv_path)
        feature_cols = ["semantic_similarity", "skill_overlap", "weighted_skills", "experience_match", "education_match"]
        X = df[feature_cols].values
        y = df["match_score"].values
    else:
        print("No CSV provided or file not found. Generating synthetic training matrix (N=2500 pairs)...")
        np.random.seed(1337)
        N = 2500
        
        f1 = np.random.beta(5, 2, N)  # semantic_similarity
        f2 = np.random.beta(3, 3, N)  # skill_overlap
        f3 = np.random.beta(4, 2, N)  # weighted_skills
        f4 = np.random.beta(5, 2, N)  # experience_match
        f5 = np.random.choice([0.5, 0.75, 1.0], size=N, p=[0.1, 0.2, 0.7])  # education_match

        X = np.column_stack([f1, f2, f3, f4, f5])
        
        # Ground truth formulation
        y = (0.35 * f1 + 0.30 * f3 + 0.15 * f2 + 0.12 * f4 + 0.08 * f5) * 100.0
        # Add realistic evaluation noise
        y = y + np.random.normal(0, 2.0, N)
        y = np.clip(y, 10.0, 99.0)

    model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )

    model.fit(X, y)

    model.save_model(output_model_path)
    print(f"Successfully trained and saved XGBoost matcher model to: {output_model_path}")

if __name__ == "__main__":
    train_xgboost_matcher()
