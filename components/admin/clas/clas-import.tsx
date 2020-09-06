import * as files from "../../common/files";
import AlertPanel, {AlertProps, AlertSeverity} from "../../common/alert";
import ErrorPanel, {ErrorProps} from "../../common/error";
import FileInfo from "../../common/forms/file-info";
import FileInput from "../../common/forms/file-input";
import Loader from "../../common/loader";
import React from "react";
import uniqueId from "lodash/uniqueId";
import {ApplicationError, get, post} from "../../fetch";
import {Component, ReactElement} from "react";
import {ParseError, UnsupportedFileType} from "../../common/errors";
import {parseSync as parseCSV} from "../../common/csv";
import FileExamples, {FileExample} from "../../common/forms/file-examples";
import {Button, TextField} from "@material-ui/core";
import {AgreementListItem} from "../agreements/contracts";
import DynamicSelect from "../../common/forms/select-named-dynamic";
import {validateEmail} from "../../../service/common/emails";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import ErrorOutline from "@material-ui/icons/ErrorOutline";
import NotInterestedIcon from "@material-ui/icons/NotInterested";
import Publish from "@material-ui/icons/Publish";

enum ImportEntryStatus {
  valid = "valid",
  invalid = "invalid",
  success = "success",
  failure = "failure",
}

interface ImportUIEntry {
  id: string;
  email: string;
  emailError: boolean;
  emailHelperText: string;
  username: string;
  usernameError: boolean;
  usernameHelperText: string;
  status: ImportEntryStatus;
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

interface ImportOutput {
  foo: string;
}

interface ClasImportState {
  loading: boolean;
  waiting: boolean;
  error?: ErrorProps;
  submitError?: ErrorProps;
  output?: ImportOutput;
  selectedFile: File | null;
  fileProblem?: AlertProps;
  entries: ImportUIEntry[];
  selectedAgreement: AgreementListItem | null;
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
      selectedAgreement: null,
    };
    this.fileInput = React.createRef();
  }

  private toEntries(array: any[]): ImportUIEntry[] {
    return array.map(this.toEntry);
  }

  private toEntry(item: any): ImportUIEntry {
    return {
      id: uniqueEntryId(),
      email: item.email || item.emailAddress || "",
      username: item.username || "",
      emailError: false,
      emailHelperText: "",
      usernameError: false,
      usernameHelperText: "",
      status: ImportEntryStatus.valid,
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

  async parseFile(file: File): Promise<ImportUIEntry[]> {
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

    let entries: ImportUIEntry[];

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

    this.validateItems(entries);

    this.setState({
      entries,
    });
  }

  validateItems(entries: ImportUIEntry[]): void {
    for (const entry of entries) {
      this.validateItem(entry);
    }
  }

  validateItem(entry: ImportUIEntry): void {
    if (!validateEmail(entry.email)) {
      entry.emailError = true;
      entry.emailHelperText = "The email address is invalid";
    }
    if (!entry.username) {
      entry.usernameError = true;
      entry.usernameHelperText = "Missing username";
    }

    if (entry.emailError || entry.usernameError) {
      entry.status = ImportEntryStatus.invalid;
    }
  }

  confirm(): void {
    // TODO: only if it contains at least one valid item...
    const {selectedAgreement, entries} = this.state;

    if (selectedAgreement === null) {
      return;
    }

    this.setState({
      waiting: true,
      submitError: undefined,
    });

    post("/api/clas/import", {
      agreementId: selectedAgreement.id,
      entries,
    }).then(
      () => {
        // TODO: display output view
        this.setState({
          waiting: false,
        });
      },
      (error: ApplicationError) => {
        this.setState({
          waiting: false,
          submitError: {},
        });
      }
    );
  }

  getAgreements(): Promise<AgreementListItem[]> {
    return get<AgreementListItem[]>("/api/agreements");
  }

  onAgreementSelect(item: AgreementListItem | null): void {
    this.setState({
      selectedAgreement: item,
    });
  }

  onAgreementsLoaded(items: AgreementListItem[]): void {
    if (!items.length) {
      // cannot import because there are no agreements configured in the system
      this.setState({
        error: {
          title: "Cannot import CLAs",
          message:
            "Before importing CLAs, it is necessary to configure " +
            "at least one agreement.",
          status: "warning",
        },
      });
    }
  }

  render(): ReactElement {
    const {error, waiting, selectedFile, fileProblem, entries} = this.state;

    return (
      <div>
        {waiting && <Loader className="overlay" />}
        <dl className="file-selection">
          <dt>Agreement</dt>
          <dd>
            <DynamicSelect<AgreementListItem>
              load={() => this.getAgreements()}
              onSelect={this.onAgreementSelect.bind(this)}
              onLoaded={this.onAgreementsLoaded.bind(this)}
            />
          </dd>
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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <TextField
                        value={item.email}
                        error={item.emailError}
                        helperText={item.emailHelperText}
                        disabled
                      />
                    </td>
                    <td>
                      <TextField
                        value={item.username}
                        error={item.usernameError}
                        helperText={item.usernameHelperText}
                        disabled
                      />
                    </td>
                    <td>{this.renderEntryStatus(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!error && (
              <div className="buttons-area">
                <Button key="confirm-button" onClick={() => this.confirm()}>
                  Confirm
                </Button>
              </div>
            )}
          </div>
        )}
        {error && <ErrorPanel {...error} />}
      </div>
    );
  }

  renderEntryStatus(item: ImportUIEntry): ReactElement {
    if (item.status === ImportEntryStatus.valid) {
      return <CheckCircleOutlineIcon className="ok" />;
    }

    if (item.status === ImportEntryStatus.failure) {
      return <ErrorOutline className="ko" />;
    }

    if (item.status === ImportEntryStatus.success) {
      return <Publish className="super" />;
    }

    return (
      <span title={"The item contains errors."}>
        <NotInterestedIcon className="ko" />
      </span>
    );
  }
}
