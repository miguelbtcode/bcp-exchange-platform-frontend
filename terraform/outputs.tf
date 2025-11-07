output "static_web_app_url" {
  description = "URL del Static Web App"
  value       = azurerm_static_web_app.swa.default_host_name
}

output "static_web_app_id" {
  description = "ID del Static Web App"
  value       = azurerm_static_web_app.swa.id
}

output "deployment_token" {
  description = "Token para desplegar en el Static Web App"
  value       = azurerm_static_web_app.swa.api_key
  sensitive   = true
}
