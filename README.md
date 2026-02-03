# Upload Release Asset GitHub Action

This action uploads a release asset to a specified GitHub release. It is useful for attaching build artifacts (such as binaries, archives, or other files) to your project's releases.

## Usage

Below is an example workflow using the **upload-release-asset** action:

```yaml
name: Build and Publish

on:
    push:
        tags:
            - 'v*.*.*'

jobs:
    build:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            # ... your build steps here ...

            - name: Upload Release Asset
                uses: Lapiniot/upload-release-asset@master
                with:
                    release_id: ${{ github.event.release.id }}
                    path: ./path/to/your-artifact.zip
                    name: your-artifact.zip
                    content_type: application/zip
                env:
                    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
## Inputs
- `release_id` (required): The ID of the release to which the asset will be uploaded.
- `path` (required): The file path of the asset to upload.
- `name` (required): The name of the uploaded asset.
- `content_type`: (required): The MIME type of the asset.
- `label`: (optional): A label for the asset.

## Outputs
- `browser_download_url`: The URL to download the uploaded asset.


## Environment Variables

- `GITHUB_TOKEN`: Required for authentication.

## License

MIT