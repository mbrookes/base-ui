import * as React from 'react';
import { createRenderer, describeConformance } from '#test-utils';
import { Dropzone } from './Dropzone';

describe('Dropzone conformance', () => {
  const { render } = createRenderer();

  describeConformance(<Dropzone>Drop files</Dropzone>, () => ({
    render,
    refInstanceof: window.HTMLDivElement,
  }));

  describeConformance(<Dropzone.HiddenInput />, () => ({
    refInstanceof: window.HTMLInputElement,
    render(node) {
      return render(<Dropzone>{node}</Dropzone>);
    },
  }));
});
