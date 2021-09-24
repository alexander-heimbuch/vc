# VC - A git cli for humans

## Installation

### Download the binary
#### OSX

```sh
curl -L (curl -s -L https://api.github.com/repos/alexander-heimbuch/vc/releases/latest | grep -o -E "https://(.*)vc(.*)vc-macos") --output /usr/local/bin/vc
```

#### Linux

```sh
curl -L (curl -s -L https://api.github.com/repos/alexander-heimbuch/vc/releases/latest | grep -o -E "https://(.*)vc(.*)vc-linux") --output /usr/local/bin/vc
```

### Verify the installation

```sh
vc --version
```

## Inspirations
- https://coderwall.com/p/euwpig/a-better-git-log
