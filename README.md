# EgyVenture

EgyVenture is a full-stack travel recommendation web application for exploring must-see attractions in Egypt. It features personalized recommendations, user authentication, and interactive UI components.

## Features

- **Personalized Recommendations:** Content-based and collaborative filtering for attractions.
- **User Authentication:** Sign up, login, and persistent sessions.
- **Like & Rate Attractions:** Users can like and rate attractions, influencing recommendations.
- **City-Based Browsing:** Explore attractions grouped by city, with sliders and "View All" options.
- **Responsive UI:** Modern, mobile-friendly design using React and Bootstrap.
- **Backend API:** Django REST API with MongoDB for flexible data storage.

## Tech Stack

- **Frontend:** React, React Router, Axios, Bootstrap, React Icons, React Slick
- **Backend:** Django 5, Django REST Framework, Djongo, MongoDB
- **Authentication:** Custom (session/localStorage)
- **Other:** CORS, RESTful API, modular component structure

## Getting Started

### Prerequisites

- Node.js & npm
- Python 3.x
- MongoDB

### Frontend Setup

```bash
cd <egyventure>
npm install
npm start
```

Runs the React app at [http://localhost:3000](http://localhost:3000).

### Backend Setup

```bash
cd egyventure_backend
pip install -r requirements.txt  # (create this if missing)
python manage.py migrate
python manage.py runserver
```

Runs the Django API at [http://127.0.0.1:8000](http://127.0.0.1:8000).

### MongoDB

Ensure MongoDB is running locally on the default port (`mongodb://localhost:27017/`).

## Project Structure

```
egyventure/
├── src/
│   ├── components/
│   │   ├── ContentBasedRec/
│   │   ├── Registration/
│   │   └── ...
│   ├── App.js
│   └── ...
├── egyventure_backend/
│   ├── app/
│   ├── egyventure_backend/
│   └── ...
├── public/
├── package.json
└── README.md
```

## Key Scripts

- `npm start` – Start React development server
- `npm run build` – Build frontend for production
- `python manage.py runserver` – Start Django backend

## API Endpoints

- `/signup/`, `/login/` – User registration & login
- `/get_attractions/` – List attractions
- `/add_to_likes/`, `/remove_from_likes/`, `/view_likes/` – Like system
- `/rate/`, `/view_ratings/` – Rating system
- `/pearson_similarity/` – Collaborative recommendations

## Customization

- Add new attractions via the backend or database.
- Adjust recommendation logic in backend `views.py`.

## License

MIT (or specify your license)
