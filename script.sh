psql -c "CREATE ROLE "user" WITH LOGIN PASSWORD 'password';" -U postgres
psql -c "GRANT ALL PRIVILEGES ON DATABASE test to "user";" -U postgres
python create_models.py
python tests.py 