# Data

Folder ini berisi dataset lokal yang tidak di-push ke GitHub karena ukurannya besar.

## Struktur

- `raw/` — dataset mentah (UTKFace, FairFace, Men Face Shape, Indo Public Figure, Dataset ZIP)
- `filtered/` — hasil filtering & cleaning (W2)
- `dataset_before_balancing/` — dataset per kelas setelah augmentasi, sebelum undersampling
- `dataset_after_balancing/` — dataset per kelas setelah balancing (oval+diamond 1500, sisanya ~1000)

## Sumber Dataset

- UTKFace: https://www.kaggle.com/datasets/jangedoo/utkface-new
- FairFace: https://www.kaggle.com/datasets/mehmoodsheikh/fairface-dataset
- Men Face Shape: https://www.kaggle.com/datasets/hanakb/men-face-shape
- Indo Public Figure: https://www.kaggle.com/datasets/arifnuriman/indonesian-public-figure-faces
- Dataset ZIP: https://drive.google.com/file/d/1aBFH2q5nIFO1RiO6UqarWpENYMwQJxLD/view?usp=drive_link

### Download Dataset

- All Datasets in raw: https://drive.google.com/file/d/19FtrMQfFzCtyeQIwDmgdr5BiD1UYrWS7/view?usp=sharing
- Dataset before and after balancing: https://drive.google.com/file/d/17AAoNjfCx3F58oqBDi7KgZ99hrWVK-36/view
