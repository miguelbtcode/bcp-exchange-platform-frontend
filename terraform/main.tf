terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "rg-bcp-exchange"
    storage_account_name = "stbcpexchange"
    container_name       = "tfstate"
    key                  = "frontend.tfstate"
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_resource_group" "rg" {
  name = "rg-bcp-exchange"
}

resource "azurerm_static_web_app" "swa" {
  name                = "swa-bcp-exchange-platform"
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = "eastasia"
  sku_tier            = "Free"
  sku_size            = "Free"
}
