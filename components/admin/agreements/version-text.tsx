import * as React from "react";
import dynamic from "next/dynamic";
import MarkdownIt from "markdown-it";
import Panel from "../../common/panel";
import { AgreementText } from "./contracts";
import { Component, ReactElement } from "react";
import { ErrorProps } from "../../common/error";
import { get, patch } from "../../fetch";
import FormView from "../../common/form-view";
import { AgreementVersion } from "../../../service/domain/agreements";


// TODO: id should be a Text id, not version id!
export interface VersionTextProps {
  id: string
  draft: boolean
  culture: string
}


export interface VersionTextState {
  title: string
  body: string
  text_id: string
  error?: ErrorProps
  loading: boolean,
  mod_title: string
  mod_body: string
  editing: boolean,
  draft: boolean
}

const mdParser = new MarkdownIt();

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false
});


interface IEditorChange {
  html: string,
  text: string
}


/**
 * Provides UI and methods to edit the texts of a given agreement version
 * and culture code.
 */
export class VersionText
extends Component<VersionTextProps, VersionTextState> {

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
      draft: true
    }
  }

  load(): void {
    this.setState({
      error: undefined,
      loading: true
    })

    // TODO: get texts of this agreement version by culture?
    // /texts/${this.props.culture}
    get<AgreementVersion>(
      `/api/agreement-version/${this.props.id}`
    )
    .then(data => {
      const texts = data.texts;

      if (texts === undefined) {
        throw new Error("Missing texts")
      }
      const text = texts.filter(
        item => item.culture === this.props.culture
      )[0];

      this.setState({
        error: undefined,
        loading: false,
        title: text.title,
        body: text.text,
        mod_title: text.title,
        mod_body: text.text,
        text_id: text.id
      })
    }, () => {
      this.setState({
        error: {
          dismiss: () => this.setState({error: undefined})
        },
        loading: false
      })
    });
  }

  componentDidUpdate(prevProps: VersionTextProps): void {
    if (this.props.id !== prevProps.id) {
      this.load();
    }
  }

  handleEditorChange({html, text}: IEditorChange) : void {
    this.setState({
      mod_body: text
    })
  }

  async update(): Promise<void> {
    // TODO: add ETAG to entity, verify if ETAG matches on the server
    await patch(`/api/agreement-version/${this.props.id}`, {
      culture: this.props.culture,
      title: this.state.mod_title,
      text: this.state.mod_body
    })

    this.commit();
  }

  commit(): void {
    const { mod_title, mod_body } = this.state;

    this.setState({
      title: mod_title,
      body: mod_body
    })
  }

  cancel(): void {
    this.setState({
      editing: false
    })
  }

  edit(): void {
    if (!this.props.draft) {
      // cannot edit a text of a version that is not a draft.
      return;
    }

    this.setState({
      editing: true
    })
  }

  renderTextView(): ReactElement {
    const state = this.state;

    if (false === this.props.draft) {
      // return a read-only view of the existing text
      return <div dangerouslySetInnerHTML={{
        __html: mdParser.render(state.body)
      }}></div>;
    }

    const editing = state.editing;

    return <FormView
      submit={async () => await this.update()}
      edit={() => this.edit()}
      cancel={() => this.cancel()}
      editing={editing}
    >
      {editing ?
      <MdEditor
        value={state.mod_body}
        style={{ height: "500px" }}
        renderHTML={(text) => mdParser.render(text)}
        onChange={this.handleEditorChange.bind(this)}
      />
      : <div dangerouslySetInnerHTML={{
        __html: mdParser.render(state.body)
      }}></div>
      }
    </FormView>;
  }

  render(): ReactElement {
    const state = this.state;

    return <div>
      <Panel
        error={state.error}
        load={() => this.load()}
        loading={state.loading}
      >
        <div>
          <dl className="inline">
            <dt>Title</dt>
            <dd>{state.title}</dd>
            <dt>Body</dt>
            <dd>{this.renderTextView()}</dd>
          </dl>
        </div>
      </Panel>
    </div>
  }
}
