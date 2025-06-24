import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from bson.objectid import ObjectId


def calculate_imdb_weighted_score(df, min_ratings=50):
    """
    Calculate IMDb weighted rating score for a DataFrame.
    Weighted Score = (v/(v+m)) * R + (m/(v+m)) * C
    Where: R = rating, v = numberOfRatings, m = min_ratings, C = mean rating
    """
    mean_rating = df['rating'].mean()
    df['weighted_score'] = df.apply(
        lambda row: (row['numberOfRatings'] / (row['numberOfRatings'] + min_ratings)) * row['rating'] +
                    (min_ratings / (row['numberOfRatings'] + min_ratings)) * mean_rating,
        axis=1
    )
    df['weighted_score'] = df['weighted_score'].round(2)
    df['weighted_score'] = df['weighted_score'].astype(float)
    df = df[:5]
    return df.sort_values('weighted_score', ascending=False)

def get_recommendations_by_id(attractions, attraction_id, n=5):
    """
    Returns a DataFrame of top-n recommended attractions based on TF-IDF cosine similarity.
    Args:
        attractions (list): List of attractions.
        attraction_id (str or ObjectId): The _id of the attraction to base recommendations on
        n (int): Number of recommendations to return
    Returns:
        pd.DataFrame: DataFrame with columns ['name', 'rating', 'numberOfRatings', 'weighted_score']
    """
    for field in ['description', 'categories', 'name', 'rating', 'numberOfRatings']:
        if field not in attractions.columns:
            raise ValueError(f"Missing required field '{field}' in attractions collection.")

    attractions['combined'] = attractions['description'].astype(str) + ' ' + attractions['categories'].astype(str)
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(attractions['combined'])
    id_to_index = pd.Series(attractions.index, index=attractions['_id']).drop_duplicates()

    try:
        if not isinstance(attraction_id, ObjectId):
            try:
                attraction_id = ObjectId(attraction_id)
            except Exception:
                raise ValueError(f"Invalid attraction id: {attraction_id}")
        idx = id_to_index.get(attraction_id)
        if idx is None:
            raise ValueError(f"Attraction id '{attraction_id}' not found.")
        sim_scores = list(enumerate(cosine_similarity(tfidf_matrix[idx], tfidf_matrix)[0]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = [score for score in sim_scores if score[0] != idx]
        top_indices = [i[0] for i in sim_scores[:]]
        result_df = attractions.iloc[top_indices][['_id', 'name', 'rating', 'numberOfRatings']].copy()

        # Apply IMDb weighted rating and sort
        return calculate_imdb_weighted_score(result_df)
    except Exception as e:
        raise RuntimeError(f"Error in recommendation: {e}")

def recommend(attractions, attraction_id):
    attractions = pd.DataFrame(attractions)
    test_id = ObjectId(attraction_id)
    print("Cosine TF-IDF Recommendations:")
    tfidf_recs = get_recommendations_by_id(attractions, test_id, n=5)
    print(tfidf_recs)

    return tfidf_recs.to_dict('records')
