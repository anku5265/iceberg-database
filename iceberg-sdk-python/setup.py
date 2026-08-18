from setuptools import setup, find_packages

setup(
    name="iceberg-db",
    version="0.1.0",
    description="Python SDK for Iceberg — Vector search infrastructure for Indian AI teams",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=["httpx>=0.27.0"],
)
