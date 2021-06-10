.PHONY: all deps codegen build clean doc test sign claims

CRATE_FS_NAME:=$(shell cargo metadata --no-deps --format-version 1 | jq -r '.packages[0].name' | tr '-' '_')
CAPABILITIES:=$(shell cargo metadata --no-deps --format-version 1 | jq -r '.packages[0].metadata.wasmcloud.capabilities | map("--cap=\(.)") | join(" ")' 2> /dev/null)
CRATE_NAME:=$(shell cargo metadata --no-deps --format-version 1 | jq -r '.packages[0].name')
CRATE_VERSION:=$(shell cargo metadata --no-deps --format-version 1 | jq -r '.packages[0].version ')
BUILD_DIR:=build
SIGNED_ARTIFACT:=$(BUILD_DIR)/$(CRATE_FS_NAME)_s.wasm
BUILD_ARTIFACT:=$(BUILD_DIR)/$(CRATE_FS_NAME).wasm

INPUTS:=$(shell widl2json schema.widl | jq -r '.definitions[] | select(.name.value == "Inputs") | .fields | map("--input-port=\(.name.value)")| join(" ")')
OUTPUTS:=$(shell widl2json schema.widl | jq -r '.definitions[] | select(.name.value == "Outputs") | .fields | map("--output-port=\(.name.value)")| join(" ")')

all: deps codegen build sign claims

deps:
	mkdir -p build

codegen:
	vino-codegen rust schema.widl -t sdk-integration -o src/generated.rs -f
	vino-codegen rust schema.widl -t guest-boilerplate -o src/lib.rs

build:
	cargo build --target wasm32-unknown-unknown --release
	cp target/wasm32-unknown-unknown/release/$(CRATE_FS_NAME).wasm build/

sign:
	wash claims sign $(BUILD_ARTIFACT) $(CAPABILITIES) \
  	--name=$(CRATE_NAME) \
  	--ver=$(CRATE_VERSION) \
  	--rev=0 \
  	$(INPUTS) \
  	$(OUTPUTS)

claims:
	wash claims inspect $(SIGNED_ARTIFACT)

# Rust builds accrue disk space over time (specifically the target directory),
# so running `make clean` should be done periodically.
clean:
	cargo clean
	rm -Rf build

doc:

test: build
	cargo test
