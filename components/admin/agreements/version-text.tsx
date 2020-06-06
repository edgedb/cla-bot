import * as React from "react";
import dynamic from "next/dynamic";
import MarkdownIt from "markdown-it";
import Panel from "../../common/panel";
import {AgreementText} from "./contracts";
import {Component, ReactElement} from "react";
import {ErrorProps} from "../../common/error";
import {get, put} from "../../fetch";
import FormView from "../../common/form-view";
import formatDate from "../../format-date";
import {changeHandler} from "../../forms";
import {TextField} from "@material-ui/core";
import ClaView from "../../common/cla-view";

export interface VersionTextProps {
  versionId: string;
  draft: boolean;
  culture: string;
}

export interface VersionTextState {
  title: string;
  titleError: boolean;
  titleHelperText: string;
  body: string;
  bodyError: boolean;
  bodyHelperText: string;
  text_id: string;
  error?: ErrorProps;
  loading: boolean;
  mod_title: string;
  mod_body: string;
  editing: boolean;
  lastUpdateTime?: Date;
}

const mdParser = new MarkdownIt();
const FullScreenEditingBodyClass = "fullscreen-editing";

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), {
  ssr: false,
});

interface IEditorChange {
  html: string;
  text: string;
}

/**
 * Provides UI and methods to edit the texts of a given agreement version
 * and culture code.
 */
export class VersionText extends Component<
  VersionTextProps,
  VersionTextState
> {
  constructor(props: VersionTextProps) {
    super(props);

    this.state = {
      title: "",
      body: "",
      mod_title: "",
      mod_body: "",
      error: undefined,
      loading: true,
      editing: false,
      text_id: "",
      lastUpdateTime: undefined,
      titleError: false,
      titleHelperText: "",
      bodyError: false,
      bodyHelperText: "",
    };
  }

  get URL(): string {
    return `/api/agreement-version/${this.props.versionId}/texts/${this.props.culture}`;
  }

  load(): void {
    this.setState({
      error: undefined,
      loading: true,
    });

    get<AgreementText>(this.URL).then(
      (data) => {
        this.setState({
          error: undefined,
          loading: false,
          title: data.title,
          body: data.text,
          mod_title: data.title,
          mod_body: data.text,
          text_id: data.id,
          lastUpdateTime: new Date(data.updateTime),
          editing: false,
        });
      },
      () => {
        this.setState({
          error: {
            dismiss: () => this.setState({error: undefined}),
          },
          loading: false,
        });
      }
    );
  }

  componentDidUpdate(prevProps: VersionTextProps): void {
    if (this.props.versionId !== prevProps.versionId) {
      this.load();
    }
  }

  handleEditorChange({html, text}: IEditorChange): void {
    this.setState({
      mod_body: text,
    });
  }

  validate(): boolean {
    let anyError = false;
    const {mod_title, mod_body} = this.state;

    if (!mod_title.trim()) {
      this.setState({
        titleError: true,
        titleHelperText: "Please insert a valid value",
      });
      anyError = true;
    }

    if (!mod_body.trim()) {
      this.setState({
        bodyError: true,
        bodyHelperText: "Please insert a valid value",
      });
      anyError = true;
    }

    return !anyError;
  }

  async update(): Promise<void> {
    if (!this.validate()) return;

    // NB: errors are handled inside FormView, so here we let
    // the exception happen if something goes wrong when putting.

    // TODO: add ETAG to entity, verify if ETAG matches on the server
    await put(this.URL, {
      title: this.state.mod_title,
      text: this.state.mod_body,
    });

    this.commit();
  }

  commit(): void {
    const {mod_title, mod_body} = this.state;

    this.setState({
      title: mod_title,
      body: mod_body,
      lastUpdateTime: new Date(), // TODO: retrieve from server
    });
  }

  cancel(): void {
    this.setState({
      editing: false,
    });
  }

  edit(): void {
    if (!this.props.draft) {
      // cannot edit a text of a version that is not a draft.
      return;
    }

    this.setState({
      editing: true,
    });
  }

  toggleBodyFullScreenEditingClass(): void {
    const bodyClasses = document.body.classList;
    if (bodyClasses.contains(FullScreenEditingBodyClass)) {
      bodyClasses.remove(FullScreenEditingBodyClass);
    } else {
      bodyClasses.add(FullScreenEditingBodyClass);
    }
  }

  private removeBodyFullScreenEditingClass(): void {
    document.body.classList.remove(FullScreenEditingBodyClass);
  }

  componentDidMount(): void {
    this.removeBodyFullScreenEditingClass();
  }

  componentWillUnmount(): void {
    this.removeBodyFullScreenEditingClass();
  }

  handleOnClick(e: React.MouseEvent<HTMLDivElement>): void {
    // NB: MdEditor doesn't offer an API to react on full screen view change.
    // If an error happens while saving during full screen editing,
    // we need to display the error message on top of the page (fixed position)
    // and above the Markdown editor.
    // This code applies a class to the body, depending whether the editor
    // is in full screen.

    // @ts-ignore
    const targetClassList: DOMTokenList = e.target.classList;

    if (
      targetClassList.contains("button-type-fullscreen") ||
      targetClassList.contains("rmel-icon-fullscreen") ||
      targetClassList.contains("rmel-icon-fullscreen-exit")
    ) {
      this.toggleBodyFullScreenEditingClass();
    }
  }

  renderReadOnlyTextView(): ReactElement {
    return (
      <div id="read-only-preview">
        <ClaView body={this.state.body} />
      </div>
    );
  }

  renderTextView(): ReactElement {
    const state = this.state;

    if (false === this.props.draft) {
      return this.renderReadOnlyTextView();
    }

    const editing = state.editing;

    return editing ? (
      <div onClick={this.handleOnClick.bind(this)}>
        <MdEditor
          value={state.mod_body}
          style={{height: "500px"}}
          renderHTML={(text) => mdParser.render(text)}
          onChange={this.handleEditorChange.bind(this)}
        />
        {state.bodyError && (
          <i className="error-info">{state.bodyHelperText}</i>
        )}
      </div>
    ) : (
      this.renderReadOnlyTextView()
    );
  }

  render(): ReactElement {
    const state = this.state;
    const editing = state.editing;

    return (
      <div>
        <Panel
          error={state.error}
          load={() => this.load()}
          loading={state.loading}
        >
          <FormView
            submit={async () => await this.update()}
            edit={() => this.edit()}
            cancel={() => this.cancel()}
            editing={editing}
            readonly={!this.props.draft}
          >
            <dl className="inline">
              {state.lastUpdateTime !== undefined && (
                <React.Fragment>
                  <dt>Last updated at</dt>
                  <dd>{formatDate(state.lastUpdateTime)}</dd>
                </React.Fragment>
              )}
              <dt>Title</dt>
              <dd>
                {state.editing ? (
                  <TextField
                    error={state.titleError}
                    helperText={state.titleHelperText}
                    name="mod_title"
                    variant="outlined"
                    autoComplete="off"
                    autoFocus
                    value={state.mod_title}
                    onChange={changeHandler.bind(this)}
                  />
                ) : (
                  state.title
                )}
              </dd>
              <dt>Body</dt>
              <dd>{this.renderTextView()}</dd>
            </dl>
          </FormView>
        </Panel>
      </div>
    );
  }
}
