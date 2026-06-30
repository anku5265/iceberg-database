# Qora BYOC — Deploy on Your Cloud

Deploy Qora in YOUR AWS account. Your data never leaves your infrastructure.

## Prerequisites

- AWS account
- Terraform installed (`brew install terraform` or https://terraform.io)
- Qora BYOC license key from https://dashboard.qora.in/byoc

## Deploy in 3 commands

```bash
git clone https://github.com/qora-db/qora-terraform
cd qora-terraform

terraform init
terraform apply \
  -var="qora_license_key=your_license_key" \
  -var="admin_api_key=your_strong_api_key"
```

## What gets created

- VPC with isolated network
- EC2 instance (t3.medium — Mumbai region by default)
- Security group (port 8000 open, SSH for your access)
- Encrypted EBS volume (100GB) for persistent vector storage
- Qora API running as systemd service

## Security

- All data encrypted at rest (EBS encryption)
- Qora HQ has ZERO inbound access to your instance
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
