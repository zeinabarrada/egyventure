from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from collections import defaultdict
from bson.objectid import ObjectId


def encode_reviews(df, model):
    """Encodes reviews using the SentenceTransformer model."""
    if 'review' in df.columns and not df.empty:

        df['review_embedding'] = list(model.encode(df['review'].tolist()))

    return df


# --- Recommendation Logic ---
def get_user_similarity(reviews_df, target_user_id):
    """Calculates similarity between the target user and all other users."""
    user_similarity = defaultdict(float)
    user_review_count = defaultdict(int)

    target_user_reviews = reviews_df[reviews_df['user_id'] == target_user_id]
    if target_user_reviews.empty:
        print(f"No reviews found for target user: {target_user_id}")
        return {}

    for _, target_review in target_user_reviews.iterrows():
        attraction_id = target_review['attraction_id']
        target_embedding = target_review['review_embedding']

        # Find other users who reviewed the same attraction
        other_reviews = reviews_df[
            (reviews_df['attraction_id'] == attraction_id) & (reviews_df['user_id'] != target_user_id)]

        for _, other_review in other_reviews.iterrows():
            other_user_id = other_review['user_id']
            other_embedding = other_review['review_embedding']

            # Calculate cosine similarity between review embeddings
            similarity = cosine_similarity([target_embedding], [other_embedding])[0][0]

            user_similarity[other_user_id] += similarity
            user_review_count[other_user_id] += 1

    # Average the similarity scores
    for user_id in user_similarity:
        if user_review_count[user_id] > 0:
            user_similarity[user_id] /= user_review_count[user_id]

    return user_similarity


def recommend_attractions(attractions_collection, reviews_df, user_similarity, target_user_id, top_n=5):
    """Recommends attractions to the target user based on similar users."""
    if not user_similarity:
        print("Cannot generate recommendations without user similarity scores.")
        return []

    # Get attractions reviewed by the target user
    target_user_reviewed_attractions = set(reviews_df[reviews_df['user_id'] == target_user_id]['attraction_id'])

    # Get a sorted list of similar users
    similar_users = sorted(user_similarity.items(), key=lambda item: item[1], reverse=True)

    threshold = 0.2
    users_above_threshold = [user for user, score in similar_users if score > threshold]

    if not users_above_threshold:
        print(f"No similar users found above threshold {threshold}. Cannot generate recommendations.")
        return []

    recommendations = {}
    for other_user_id, similarity_score in similar_users:
        if similarity_score <= threshold:
            continue

        # Get attractions reviewed by the similar user
        other_user_reviews = reviews_df[reviews_df['user_id'] == other_user_id]

        for _, review in other_user_reviews.iterrows():
            attraction_id = review['attraction_id']
            if attraction_id not in target_user_reviewed_attractions:
                # Aggregate scores for each potential recommendation
                recommendations[attraction_id] = recommendations.get(attraction_id, 0) + similarity_score

    # Sort recommendations by score
    sorted_recommendations = sorted(recommendations.items(), key=lambda item: item[1], reverse=True)

    # Fetch attraction names for the top N recommendations
    top_recommendations = []
    for attraction_id, score in sorted_recommendations[:top_n]:
        try:
            attraction_oid = ObjectId(attraction_id)
        except Exception as e:
            print(f"Warning: Invalid ObjectId '{attraction_id}'. Skipping. Error: {e}")
            continue

        attraction_details = attractions_collection.find_one({'_id': attraction_oid})
        if attraction_details:
            top_recommendations.append({
                "attraction_name": attraction_details.get('name', 'Unknown'),
                "attraction_id": attraction_id,
                "score": score
            })

    return top_recommendations


# --- Main Execution ---
def main(attractions_collection, reviews_collection, target_user_id):
    try:
        model = SentenceTransformer('all-mpnet-base-v2')
        print("SentenceTransformer model 'all-mpnet-base-v2' loaded.")
    except Exception as e:
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("SentenceTransformer model 'all-MiniLM-L6-v2' loaded.")

    # 1. Fetch and process data
    reviews_df = pd.DataFrame(list(reviews_collection.find()))
    reviews_df_encoded = encode_reviews(reviews_df.copy(), model)

    similarity_scores = get_user_similarity(reviews_df_encoded, target_user_id)

    if similarity_scores:
        # 2. Generate and display recommendations
        recommendations = recommend_attractions(attractions_collection, reviews_df_encoded, similarity_scores, target_user_id)

        if recommendations:
            return recommendations
    return []
