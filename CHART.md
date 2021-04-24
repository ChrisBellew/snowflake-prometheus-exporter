# Hosting the chart repo

## Creating a PGP key
Create a new key. Remember the name you used.
```
gpg --gen-key
```

Export keys to a gpg
```
gpg --export-secret-keys >~/.gnupg/secring.gpg
```

Sign the helm package
```
helm package --sign --key '<thenamefromkeyabove>' --keyring ~/.gnupg/secring.gpg --destination ./charts ./helm/snowflake-prometheus-exporter/
```

Verify the package
```
helm verify ./charts/snowflake-prometheus-exporter-1.0.0.tgz --keyring ~/.gnupg/secring.gpg
```
