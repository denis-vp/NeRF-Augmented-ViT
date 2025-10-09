from setuptools import setup, find_packages

def parse_requirements(filename):
    with open(filename, encoding="utf-8") as f:
        lines = f.readlines()
    return [
        line.strip()
        for line in lines
        if line.strip() and not line.startswith("#")
    ]

setup(
    name="nerf-demo",
    version="0.1.0",
    description="NeRF Demo Application",
    author="Denis Pop",
    author_email="pop.denis.v@gmail.com",
    packages=find_packages(),
    install_requires=parse_requirements("requirements.txt"),
    python_requires=">=3.8",
    include_package_data=True,
)