"""
Machine Learning Configuration - LSTM Model Settings
Cấu hình cho mô hình LSTM dự báo chất lượng không khí
"""
import os
from typing import Dict, Any
from pydantic_settings import BaseSettings

class MLSettings(BaseSettings):
    """Cấu hình cho Machine Learning models"""
    
    # LSTM Model Configuration
    LSTM_SEQUENCE_LENGTH: int = 24  # Số giờ để dự báo
    LSTM_HIDDEN_LAYERS: int = 2     # Số hidden layers
    LSTM_UNITS: int = 128           # Số units trong mỗi layer
    LSTM_DROPOUT: float = 0.2       # Dropout rate
    LSTM_LEARNING_RATE: float = 0.001
    
    # Training Configuration
    TRAINING_EPOCHS: int = 100
    TRAINING_BATCH_SIZE: int = 32
    TRAINING_VALIDATION_SPLIT: float = 0.2
    
    # Data Preprocessing
    MIN_MAX_SCALER_RANGE: tuple = (0, 1)
    SLIDING_WINDOW_SIZE: int = 168  # 7 ngày * 24 giờ
    
    # Model Paths
    MODEL_SAVE_PATH: str = "models/"
    LSTM_MODEL_NAME: str = "aqi_lstm_model.h5"
    SCALER_MODEL_NAME: str = "aqi_scaler.pkl"
    
    # Feature Configuration
    FEATURE_COLUMNS: list = [
        'pm2_5', 'temperature_2m', 'relative_humidity_2m',
        'wind_speed_10m', 'wind_direction_10m', 'pressure_msl'
    ]
    
    TARGET_COLUMN: str = 'pm2_5'
    
    # Prediction Configuration
    PREDICTION_HORIZON: int = 24    # Số giờ dự báo
    CONFIDENCE_THRESHOLD: float = 0.7
    
    # Model Performance Thresholds
    MIN_R2_SCORE: float = 0.8
    MAX_MAE: float = 10.0
    MAX_MAPE: float = 15.0
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Tạo instance global ML settings
ml_settings = MLSettings()

# LSTM Model Architecture Configuration
LSTM_MODEL_CONFIG = {
    "input_shape": (ml_settings.LSTM_SEQUENCE_LENGTH, len(ml_settings.FEATURE_COLUMNS)),
    "hidden_layers": ml_settings.LSTM_HIDDEN_LAYERS,
    "units": ml_settings.LSTM_UNITS,
    "dropout": ml_settings.LSTM_DROPOUT,
    "learning_rate": ml_settings.LSTM_LEARNING_RATE,
    "output_units": 1,
    "activation": "relu",
    "recurrent_activation": "sigmoid"
}

# Data Preprocessing Configuration
PREPROCESSING_CONFIG = {
    "sequence_length": ml_settings.LSTM_SEQUENCE_LENGTH,
    "sliding_window_size": ml_settings.SLIDING_WINDOW_SIZE,
    "feature_columns": ml_settings.FEATURE_COLUMNS,
    "target_column": ml_settings.TARGET_COLUMN,
    "scaler_range": ml_settings.MIN_MAX_SCALER_RANGE,
    "fill_method": "forward",  # forward fill cho missing values
    "outlier_threshold": 3.0   # 3 standard deviations
}

# Training Configuration
TRAINING_CONFIG = {
    "epochs": ml_settings.TRAINING_EPOCHS,
    "batch_size": ml_settings.TRAINING_BATCH_SIZE,
    "validation_split": ml_settings.TRAINING_VALIDATION_SPLIT,
    "early_stopping_patience": 10,
    "reduce_lr_patience": 5,
    "reduce_lr_factor": 0.5,
    "min_lr": 1e-7
}

# Evaluation Metrics Configuration
EVALUATION_CONFIG = {
    "metrics": ["mae", "mse", "mape", "r2"],
    "cross_validation_folds": 5,
    "test_size": 0.2,
    "random_state": 42
}

# Production Model Configuration
PRODUCTION_CONFIG = {
    "model_update_frequency": "daily",  # Cập nhật model hàng ngày
    "retraining_threshold": 0.1,        # Retrain khi performance giảm 10%
    "model_versioning": True,           # Lưu version của model
    "backup_models": 3,                 # Số lượng model backup
    "performance_monitoring": True       # Monitor performance liên tục
}

