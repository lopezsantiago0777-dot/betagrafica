import io
import os
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import app


class DummyCursor:
    def __init__(self):
        self.queries = []

    def execute(self, query, params=None):
        self.queries.append((query, params))
        return None

    def fetchone(self):
        return None

    def fetchall(self):
        return []

    def close(self):
        return None


class DummyConnection:
    def __init__(self):
        self.cursor_obj = DummyCursor()
        self.commits = 0

    def cursor(self, dictionary=False):
        return self.cursor_obj

    def commit(self):
        self.commits += 1

    def rollback(self):
        return None

    def close(self):
        return None


class CarouselUploadTestCase(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmpdir.cleanup)
        self.original_upload_folder = app.config.get('UPLOAD_FOLDER')
        app.config['UPLOAD_FOLDER'] = self.tmpdir.name

    def tearDown(self):
        if self.original_upload_folder is not None:
            app.config['UPLOAD_FOLDER'] = self.original_upload_folder

    def test_uploading_a_carousel_file_saves_it_and_persists_path(self):
        conn = DummyConnection()

        with patch('app.get_db_connection', return_value=conn):
            with app.test_client() as client:
                response = client.post(
                    '/api/carousel',
                    data={
                        'titulo': 'Portada nueva',
                        'producto_id': '2',
                        'imagen': (io.BytesIO(b'fake-image-data'), 'slide.png'),
                    },
                    content_type='multipart/form-data',
                )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(conn.commits, 1)

        insert_query, params = conn.cursor_obj.queries[-1]
        self.assertIn('INSERT INTO carousel_items', insert_query)
        self.assertTrue(params[1])
        self.assertTrue(params[1].endswith('.png'))

        saved_path = params[1]
        self.assertTrue(os.path.exists(os.path.join(self.tmpdir.name, saved_path)))


if __name__ == '__main__':
    unittest.main()
