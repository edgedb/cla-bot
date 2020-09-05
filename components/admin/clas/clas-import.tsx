import * as files from "../../common/files";
import AlertPanel, {AlertProps, AlertSeverity} from "../../common/alert";
import ErrorPanel from "../../common/error";
import FileInfo from "../../common/forms/file-info";
import FileInput from "../../common/forms/file-input";
import Loader from "../../common/loader";
import React from "react";
import uniqueId from "lodash/uniqueId";
import {ApplicationError} from "../../fetch";
import {Component, ReactElement} from "react";
import {ParseError, UnsupportedFileType} from "../../common/errors";
import {parseSync as parseCSV} from "../../common/csv";
import FileExamples, {FileExample} from "../../common/forms/file-examples";
import {Button} from "@material-ui/core";

interface ImportOutput {
  foo: string;
}

interface ImportEntry {
  id: string;
  email: string;
  username: string;
}

const Examples: FileExample[] = [
  {
    id: "csv",
    name: "CSV",
    href: "/import-examples/example.csv",
  },
  {
    id: "plain",
    name: "Plain text",
    href: "/import-examples/example.txt",
  },
  {
    id: "json",
    name: "JSON",
    href: "/import-examples/example.json",
  },
];

interface ClasImportState {
  loading: boolean;
  waiting: boolean;
  error?: ApplicationError;
  output?: ImportOutput;
  selectedFile: File | null;
  fileProblem?: AlertProps;
  entries: ImportEntry[];
}

function uniqueEntryId(): string {
  return uniqueId("entry-");
}

export class ClasImport extends Component<{}, ClasImportState> {
  private fileInput: React.RefObject<FileInput>;

  constructor(props: {}) {
    super(props);

    this.state = {
      loading: false,
      error: undefined,
      waiting: false,
      selectedFile: null,
      entries: [],
    };
    this.fileInput = React.createRef();
  }

  private toEntries(array: any[]): ImportEntry[] {
    return array.map(this.toEntry);
  }

  private toEntry(item: any): ImportEntry {
    return {
      id: uniqueEntryId(),
      email: item.email || item.emailAddress || "",
      username: item.username || "",
    };
  }

  private parseCSV(text: string): any[] {
    try {
      return parseCSV(text);
    } catch (error) {
      throw new ParseError(`${error}`);
    }
  }

  private parseJSON(text: string): any[] {
    try {
      const data = JSON.parse(text);

      if (data instanceof Array) {
        return data;
      }

      if (data.entries) {
        return data.entries;
      }
    } catch (error) {
      throw new ParseError(`${error}`);
    }

    return [];
  }

  private parsePlainText(text: string): any[] {
    try {
      // skip empty lines
      const lines = text.split(/\n/g).filter((value) => !!value);

      return lines.map((line) => {
        const parts = line.split(/\s+/g);

        if (parts.length === 1) {
          return {
            email: parts[0].trim(),
            username: "",
          };
        }

        if (parts.length > 1) {
          return {
            email: parts[0].trim(),
            username: parts[1].trim(),
          };
        }

        return {};
      });
    } catch (error) {
      throw new ParseError(`${error}`);
    }
  }

  async parseFile(file: File): Promise<ImportEntry[]> {
    const type = file.type;
    let contents: string;

    // in Windows, csv files have mime ms-excel :)
    if (type.indexOf("ms-excel") > -1) {
      if (file.name.endsWith(".csv")) {
        contents = await files.readFileAsText(file);
        return this.toEntries(this.parseCSV(contents));
      }
    }

    switch (type) {
      case "application/json":
        contents = await files.readFileAsText(file);
        return this.toEntries(this.parseJSON(contents));
      case "text/csv":
        contents = await files.readFileAsText(file);
        return this.toEntries(this.parseCSV(contents));
      case "text/plain":
        // read one email address by line
        contents = await files.readFileAsText(file);
        return this.toEntries(this.parsePlainText(contents));
      default:
        throw new UnsupportedFileType(type);
    }
  }

  async onFileSelect(file: File | null): Promise<void> {
    this.setState({
      selectedFile: file,
    });

    if (file === null) {
      this.setState({
        fileProblem: undefined,
        entries: [],
      });
      return;
    }

    let entries: ImportEntry[];

    try {
      entries = await this.parseFile(file);
    } catch (error) {
      if (error instanceof UnsupportedFileType) {
        this.setState({
          fileProblem: {
            title: "Unsupported file type",
            message:
              "The selected file is not supported. " +
              "Please select a JSON, CSV, or plain text file. " +
              "See example files for reference.",
            severity: AlertSeverity.info,
          },
          entries: [],
        });
        return;
      }

      if (error instanceof ParseError) {
        this.setState({
          fileProblem: {
            title: "Cannot parse the selected file",
            message: `The selected file could not be parsed. Error: ${error}`,
            severity: AlertSeverity.info,
          },
          entries: [],
        });
        return;
      }

      throw error;
    }

    // this.validateItems(entries);

    this.setState({
      entries,
    });
  }

  confirm(): void {
    console.log("CONFIRM!");
  }

  render(): ReactElement {
    const {error, waiting, selectedFile, fileProblem, entries} = this.state;

    return (
      <div>
        {waiting && <Loader className="overlay" />}
        <dl className="file-selection">
          <dt>Source</dt>
          <dd>
            <FileInput
              name="file-source"
              accept="text/csv; application/json; text/plain"
              onSelect={this.onFileSelect.bind(this)}
              ref={this.fileInput}
            />
            {selectedFile && (
              <FileInfo
                name={selectedFile.name}
                size={selectedFile.size}
                type={selectedFile.type}
                lastModified={selectedFile.lastModified}
              />
            )}
          </dd>
          <dt>Download an example file</dt>
          <dd className="examples-dd">
            <FileExamples items={Examples} />
          </dd>
        </dl>
        {fileProblem && <AlertPanel {...fileProblem} />}
        {entries.length > 0 && (
          <div>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Email</th>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.email}</td>
                    <td>{item.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="buttons-area">
              <Button key="confirm-button" onClick={() => this.confirm()}>
                Confirm
              </Button>
            </div>
          </div>
        )}
        {/*error && <ErrorPanel error={error} />*/}
      </div>
    );
  }
}
