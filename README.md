# Mimir

Mimir is a very simple FastAPI-based web application to record memories of your NixOS deployments.

## API documentation

### Records a deployment

```
POST /record/<identifier>
{ "toplevel": $toplevel, "bootspec": $bootspec, ... }
```

This will record a deployment at this point in time for that `<identifier>` machine.
