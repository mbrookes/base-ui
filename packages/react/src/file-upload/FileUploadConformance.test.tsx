import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';
import { createRenderer, describeConformance } from '#test-utils';

describe('FileUpload conformance', () => {
  const { render } = createRenderer();

  describeConformance(<FileUpload.Root>Content</FileUpload.Root>, () => ({
    render,
    refInstanceof: window.HTMLDivElement,
  }));

  describeConformance(<FileUpload.HiddenInput />, () => ({
    refInstanceof: window.HTMLInputElement,
    render(node) {
      return render(<FileUpload.Root>{node}</FileUpload.Root>);
    },
  }));

  describeConformance(<FileUpload.Trigger>Upload</FileUpload.Trigger>, () => ({
    refInstanceof: window.HTMLButtonElement,
    button: true,
    render(node) {
      return render(<FileUpload.Root>{node}</FileUpload.Root>);
    },
  }));

  describeConformance(<FileUpload.Remove fileId="test-id">Remove</FileUpload.Remove>, () => ({
    refInstanceof: window.HTMLButtonElement,
    button: true,
    render(node) {
      return render(<FileUpload.Root>{node}</FileUpload.Root>);
    },
  }));

  describeConformance(<FileUpload.Remove fileId="test-id">Remove</FileUpload.Remove>, () => ({
    refInstanceof: window.HTMLButtonElement,
    button: true,
    render(node) {
      return render(<FileUpload.Root>{node}</FileUpload.Root>);
    },
  }));

  describeConformance(<FileUpload.FileSize bytes={1024} />, () => ({
    refInstanceof: window.HTMLSpanElement,
    render(node) {
      return render(<FileUpload.Root>{node}</FileUpload.Root>);
    },
  }));
});
