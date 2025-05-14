# Import necessary views and path
from django.urls import path
# Import JWT token views from rest_framework_simplejwt
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from .login_and_signup import login_views
from .report_system.report_views import ReportCreateView
from .waste import waste_views
from .tip import tip_views
from .post import post_views
from .comment import comment_views
from .report_system.admin_panel_views import ModerateReportsViewSet
from .profile import profile_views
from .opentdb import views as opentdb_views

# URL patterns for all API endpoints
urlpatterns = [
    # Authentication and User Management Endpoints
    # ----------------------------------------
    
    # POST: Register a new user account with email, username and password
    path('signup/', login_views.SignUpView.as_view(), name='signup'),
    
    # POST: Authenticate a user and receive an access token
    path('login/', login_views.LoginView.as_view(), name='login'),
    # Profile picture upload endpoint
    path('api/profile/profile-picture/', profile_views.upload_profile_picture, name='upload-profile-picture'),
    # User profile update endpoint
    path('api/profile/<str:username>/bio/', profile_views.user_bio, name='user-bio'),
    # Public profile picture retrieval endpoint
    path('api/profile/<str:username>/picture/', profile_views.download_profile_picture_public, name='download-profile-picture-public'),
    # JWT token creation endpoint
    path("jwt/create/", TokenObtainPairView.as_view(), name="jwt_create"),
    
    # POST: Refresh an expired JWT access token using a valid refresh token
    path("jwt/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    # POST: Verify if a given JWT token is valid
    path("jwt/verify/", TokenVerifyView.as_view(), name="token_verify"),
    
    # GET: Check if the API server is operational and healthy
    path("status/", login_views.server_status, name="server_status"),
    
    # GET: Retrieve details of the currently authenticated user
    path("me/", login_views.get_user_info, name="user-info"),
    
    # Post Management Endpoints
    # ----------------------------------------
    
    # POST: Create a new post with text and/or image
    path("api/posts/create/", post_views.create_post, name="create_post"),
    
    # GET: Retrieve all posts across the platform, sorted by most recent first
    path("api/posts/all/", post_views.get_all_posts, name="get_all_posts"),
    
    # GET: Retrieve details of a specific post by ID including its comments
    path("api/posts/<int:post_id>/", post_views.get_post_detail, name="get_post_detail"),
    
    # GET: Retrieve all posts created by the currently authenticated user
    path("api/posts/user/", post_views.get_user_posts, name="get_user_posts"),
      # POST: Like a specific post (adds user's like reaction or removes it if already liked)
    path("api/posts/<int:post_id>/like/", post_views.like_post, name="like_post"),
    
    # POST: Dislike a specific post (adds user's dislike reaction or removes it if already disliked)
    path("api/posts/<int:post_id>/dislike/", post_views.dislike_post, name="dislike_post"),
    
    # GET: Get the current user's reaction (like/dislike) to a specific post
    path("api/posts/<int:post_id>/reaction/", post_views.get_user_reaction, name="get_user_reaction"),
    
    # POST: Save a post to the user's saved posts collection
    path("api/posts/<int:post_id>/save/", post_views.save_post, name="save_post"),
    
    # POST: Remove a post from the user's saved posts collection
    path("api/posts/<int:post_id>/unsave/", post_views.unsave_post, name="unsave_post"),
    
    # GET: Retrieve all posts saved by the current user
    path("api/posts/saved/", post_views.get_saved_posts, name="get_saved_posts"),
    
    # Comment Management Endpoints
    # ----------------------------------------
    
    # GET: Retrieve all comments for a specific post
    path("api/posts/<int:post_id>/comments/", comment_views.get_post_comments, name="get_post_comments"),
    
    # POST: Create a new comment on a specific post
    path("api/posts/<int:post_id>/comments/create/", comment_views.create_comment, name="create_comment"),
    
    # Waste Management Endpoints
    # ----------------------------------------
    
    # POST: Log a new waste entry for the current user (recycling tracking)
    path("api/waste/", waste_views.create_user_waste, name="create_user_waste"),
    
    # GET: Retrieve the top 10 users based on their waste recycling metrics
    path("api/waste/leaderboard/", waste_views.get_top_users, name="get_top_users"),
    
    # GET: Retrieve all waste entries logged by the current user
    path("api/waste/get/", waste_views.get_user_wastes, name="get_user_wastes"),
    
    # Tips Management Endpoints
    # ----------------------------------------
    
    # GET: Retrieve the most recent recycling/environmental tips
    path("api/tips/get_recent_tips", tip_views.get_recent_tips, name="get_recent_tips"),
    
    # GET: Retrieve all available tips
    path("api/tips/all/", tip_views.get_all_tips, name="get_all_tips"),
    
    # POST: Create a new tip
    path("api/tips/create/", tip_views.create_tip, name="create_tip"),
    
    # POST: Like a specific tip
    path("api/tips/<int:tip_id>/like/", tip_views.like_tip, name="like_tip"),
    
    # POST: Dislike a specific tip
    path("api/tips/<int:tip_id>/dislike/", tip_views.dislike_tip, name="dislike_tip"),
    
    
    # Admin and Moderation Endpoints
    # ----------------------------------------
    
    # GET: Retrieve a list of all reported content for moderation
    path("api/admin/reports/", ModerateReportsViewSet.as_view({'get': 'list'}), name="admin-reports-list"),
    
    # GET: Retrieve details of a specific report by its ID
    path("api/admin/reports/<int:pk>/", ModerateReportsViewSet.as_view({'get': 'retrieve'}), name="admin-reports-detail"),
    
    # POST: Process and moderate a report (approve or reject)
    path("api/admin/reports/<int:pk>/moderate/", ModerateReportsViewSet.as_view({'post': 'moderate'}), name="admin-reports-moderate"),
    
    # Reporting Endpoint
    # ----------------------------------------
    
    # POST: Report inappropriate content (posts, comments, etc.)
    path("api/<str:content_type>/<int:object_id>/report/", ReportCreateView.as_view(), name="report_content"),

    # Opentdb Trivia API Endpoints
    path('trivia/', opentdb_views.TriviaQuestionView.as_view(), name='get_trivia_question')
]
