###############################################################################
# Iceberg BYOC — Terraform Module
# Deploy Iceberg on YOUR AWS/GCP account with one command:
#   terraform init && terraform apply
#
# Your data stays in YOUR cloud. Iceberg has zero inbound access.
###############################################################################

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "aws_region" {
  description = "AWS region to deploy Iceberg"
  default     = "ap-south-1"  # Mumbai — India region
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t3.medium"  # 2 vCPU, 4GB RAM — good for up to 5M vectors
}

variable "iceberg_license_key" {
  description = "Your Iceberg BYOC license key from dashboard.icebergdb.io/byoc"
  sensitive   = true
}

variable "admin_api_key" {
  description = "Your admin API key (min 32 chars)"
  sensitive   = true
}

provider "aws" {
  region = var.aws_region
}

###############################################################################
# VPC — Isolated network
###############################################################################

resource "aws_vpc" "iceberg" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "iceberg-vpc" }
}

resource "aws_subnet" "iceberg_public" {
  vpc_id                  = aws_vpc.iceberg.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = { Name = "iceberg-subnet" }
}

resource "aws_internet_gateway" "iceberg" {
  vpc_id = aws_vpc.iceberg.id
}

resource "aws_route_table" "iceberg" {
  vpc_id = aws_vpc.iceberg.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.iceberg.id
  }
}

resource "aws_route_table_association" "iceberg" {
  subnet_id      = aws_subnet.iceberg_public.id
  route_table_id = aws_route_table.iceberg.id
}

###############################################################################
# Security Group — Only allow API port + SSH
###############################################################################

resource "aws_security_group" "iceberg" {
  name   = "iceberg-sg"
  vpc_id = aws_vpc.iceberg.id

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Iceberg API"
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH — restrict to your IP in production"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Outbound — for license heartbeat and package installs"
  }
}

###############################################################################
# EBS Volume — Persistent storage for vectors
###############################################################################

resource "aws_ebs_volume" "iceberg_data" {
  availability_zone = "${var.aws_region}a"
  size              = 100  # GB — increase as needed
  type              = "gp3"
  encrypted         = true  # Encryption at rest
  tags = { Name = "iceberg-data" }
}

###############################################################################
# EC2 Instance
###############################################################################

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "iceberg" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.iceberg_public.id
  vpc_security_group_ids = [aws_security_group.iceberg.id]

  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y python3-pip python3-venv

    # Install Iceberg
    ICEBERG_LICENSE=${var.iceberg_license_key} \
    curl -sSL https://install.icebergdb.io | bash

    # Override API key
    sed -i "s/MASTER_API_KEY=.*/MASTER_API_KEY=${var.admin_api_key}/" ~/.iceberg/.env

    systemctl restart iceberg
  EOF

  tags = { Name = "iceberg-server" }
}

resource "aws_volume_attachment" "iceberg_data" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.iceberg_data.id
  instance_id = aws_instance.iceberg.id
}

###############################################################################
# Outputs
###############################################################################

output "iceberg_api_url" {
  value       = "http://${aws_instance.iceberg.public_ip}:8000"
  description = "Your Iceberg API endpoint"
}

output "iceberg_docs_url" {
  value       = "http://${aws_instance.iceberg.public_ip}:8000/docs"
  description = "Interactive API documentation"
}

output "instance_id" {
  value = aws_instance.iceberg.id
}

output "note" {
  value = "Iceberg has ZERO inbound access to your instance. Your data stays in your AWS account."
}
