import * as React from 'react';
import { FileUpload } from '@base-ui/react/file-upload';
import { createRenderer, describeConformance } from '#test-utils';

describe('FileUpload conformance', () => {
  const { render } = createRenderer();

  describeConformance(<FileUpload.Root>Content</FileUpload.Root>, () => ({
    render,
    refInstanceof: window.HTMLDivElement,
  }));

  describeConformance(<FileUpload.Input />, () => ({
    refInstanceof: window.HTMLInputElement,
    render(node) {
      return render(<FileUpload.Root>{node}</FileUpload.Root>);
    },
  }));

  describeConformance(<FileUpload.Trigger>Upload</FileUpload.Trigger>, () => ({
    refInstanceof: window.HTMLButtonElement,
    button: true,
    render(node) {
      return render(
        <FileUpload.Root>
          <FileUpload.Input />
          {node}
        </FileUpload.Root>,
      );
    },
  }));

  describeConformance(<FileUpload.Dropzone>Drop files</FileUpload.Dropzone>, () => ({
    refInstanceof: window.HTMLDivElement,
    render(node) {
      return render(
        <FileUpload.Root>
          <FileUpload.Input />
          {node}
        </FileUpload.Root>,
      );
    },
  }));

  function FileInitializer() {
    const { addFiles } = FileUpload.useFileUploadContext();
    const initRef = React.useRef(false);

    React.useEffect(() => {
      if (initRef.current) return;
      initRef.current = true;
      
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      addFiles([file]);
    }, [addFiles]);

    return null;
  }

  describeConformance(
    <FileUpload.PreviewList>
      <li>Item</li>
    </FileUpload.PreviewList>,
    () => ({
      refInstanceof: window.HTMLUListElement,
      render(node) {
        return render(
          <FileUpload.Root>
            <FileInitializer />
            {node}
          </FileUpload.Root>,
        );
      },
    }),
  );

  describeConformance(
    <FileUpload.PreviewItem
      file={Object.assign(new File(['content'], 'item.txt', { type: 'text/plain' }), {
        id: 'preview-item-file',
        preview: 'blob:preview-item-file',
        status: 'idle' as const,
        progress: 0,
      })}
    >
      Item
    </FileUpload.PreviewItem>,
    () => ({
      refInstanceof: window.HTMLLIElement,
      render(node) {
        return render(<FileUpload.Root>{node}</FileUpload.Root>);
      },
    }),
  );
});
