# Iceberg BYOC — Deploy on Your Cloud

Deploy Iceberg in YOUR AWS account. Your data never leaves your infrastructure.

## Prerequisites

- AWS account
- Terraform installed (`brew install terraform` or https://terraform.io)
- Iceberg BYOC license key from https://dashboard.icebergdb.io/byoc

## Deploy in 3 commands

```bash
git clone https://github.com/iceberg-db/iceberg-terraform
cd iceberg-terraform

terraform init
terraform apply \
  -var="iceberg_license_key=your_license_key" \
  -var="admin_api_key=your_strong_api_key"
```

## What gets created

- VPC with isolated network
- EC2 instance (t3.medium — Mumbai region by default)
- Security group (port 8000 open, SSH for your access)
- Encrypted EBS volume (100GB) for persistent vector storage
- Iceberg API running as systemd service

## Security

- All data encrypted at rest (EBS encryption)
- Iceberg HQ has ZERO inbound access to your instance
- Your instance sends hourly anonymous heartbeat (no user data)
- SSH key pair for your access only

## Customize

```hcl
# terraform.tfvars
aws_region    = "ap-south-1"   # Mumbai
instance_type = "t3.large"     # More RAM for larger datasets
```

## Cost estimate (AWS Mumbai)

| Instance | RAM | Vectors | Cost/mo |
|---|---|---|---|
| t3.medium | 4GB | ~5M | ~$30 |
| t3.large | 8GB | ~15M | ~$60 |
| t3.xlarge | 16GB | ~50M | ~$120 |

## Destroy

```bash
terraform destroy
```
