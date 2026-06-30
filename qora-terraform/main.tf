###############################################################################
# Qora BYOC — Terraform Module
# Deploy Qora on YOUR AWS/GCP account with one command:
#   terraform init && terraform apply
#
# Your data stays in YOUR cloud. Qora has zero inbound access.
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
  description = "AWS region to deploy Qora"
  default     = "ap-south-1"  # Mumbai — India region
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t3.medium"  # 2 vCPU, 4GB RAM — good for up to 5M vectors
}

variable "qora_license_key" {
  description = "Your Qora BYOC license key from dashboard.qora.in"
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

resource "aws_vpc" "qora" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "qora-vpc" }
}

resource "aws_subnet" "qora_public" {
  vpc_id                  = aws_vpc.qora.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = { Name = "qora-subnet" }
}

resource "aws_internet_gateway" "qora" {
  vpc_id = aws_vpc.qora.id
}

resource "aws_route_table" "qora" {
  vpc_id = aws_vpc.qora.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.qora.id
  }
}

resource "aws_route_table_association" "qora" {
  subnet_id      = aws_subnet.qora_public.id
  route_table_id = aws_route_table.qora.id
}

###############################################################################
# Security Group — Only allow API port + SSH
###############################################################################

resource "aws_security_group" "qora" {
  name   = "qora-sg"
  vpc_id = aws_vpc.qora.id

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Qora API"
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

resource "aws_ebs_volume" "qora_data" {
  availability_zone = "${var.aws_region}a"
  size              = 100  # GB — increase as needed
  type              = "gp3"
  encrypted         = true  # Encryption at rest
  tags = { Name = "qora-data" }
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

resource "aws_instance" "qora" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.qora_public.id
  vpc_security_group_ids = [aws_security_group.qora.id]

  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y python3-pip python3-venv

    # Install Qora
    QORA_LICENSE=${var.qora_license_key} \
    curl -sSL https://install.qora.in | bash

    # Override API key
    sed -i "s/MASTER_API_KEY=.*/MASTER_API_KEY=${var.admin_api_key}/" ~/.qora/.env

    systemctl restart qora
  EOF

  tags = { Name = "qora-server" }
}

resource "aws_volume_attachment" "qora_data" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.qora_data.id
  instance_id = aws_instance.qora.id
}

###############################################################################
# Outputs
###############################################################################

output "qora_api_url" {
  value       = "http://${aws_instance.qora.public_ip}:8000"
  description = "Your Qora API endpoint"
}

output "qora_docs_url" {
  value       = "http://${aws_instance.qora.public_ip}:8000/docs"
  description = "Interactive API documentation"
}

output "instance_id" {
  value = aws_instance.qora.id
}

output "note" {
  value = "Qora has ZERO inbound access to your instance. Your data stays in your AWS account."
}
