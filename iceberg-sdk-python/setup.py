import os
from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
readme_path = os.path.join(here, "README.md")
long_description = ""
if os.path.exists(readme_path):
    with open(readme_path, encoding="utf-8") as f:
        long_description = f.read()

setup(
    name="icebergdb",
    version="0.1.0",
    description="Iceberg — High-performance serverless vector database for AI agents and RAG applications",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Iceberg Data Technologies",
    author_email="hello@icebergdb.in",
    url="https://icebergdb.in",
    project_urls={
        "Documentation": "https://icebergdb.in/docs",
        "Source": "https://github.com/icebergdb/iceberg",
        "Bug Tracker": "https://github.com/icebergdb/iceberg/issues",
    },
    license="MIT",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=[
        "httpx>=0.27.0",
    ],
    extras_require={
        "dev": [
            "pytest>=8.0.0",
            "build>=1.0.0",
            "twine>=5.0.0",
        ],
    },
    keywords=[
        "vector database",
        "vector search",
        "rag",
        "ai agents",
        "embeddings",
        "semantic search",
        "llm",
    ],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "Topic :: Database",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Operating System :: OS Independent",
    ],
)
