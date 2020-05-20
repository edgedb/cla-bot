import { Component, ReactElement } from "react";
import { VersionsTable } from "./versions-table";
import { Button, TextField } from "@material-ui/core";
import FormView from "../../common/form-view";
import { AgreementDetails } from "./contracts";
import { changeHandler } from "../../forms";
import formatDate from "../../format-date";


export interface AgreementDetailsProps {
  update: (name: string, description: string) => void
  details: AgreementDetails
}


export interface AgreementDetailsState {
  mod_name: string
  mod_description: string
  editing: boolean
}


export class AgreementDetailsView
extends Component<AgreementDetailsProps, AgreementDetailsState> {

  constructor(props: AgreementDetailsProps) {
    super(props);

    this.state = {
      mod_name: props.details.name,
      mod_description: props.details.description,
      editing: false
    }
  }

  toggleEdit(): void {
    this.setState({
      editing: !this.state.editing
    })
  }

  async submit(): Promise<void> {
    const id = this.props.details.id;

    // TODO: add ETAG to entity, verify if ETAG matches on the server
    // TODO: replace with common wrapper for fetch calls
    const response = await fetch(`/api/agreements/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: this.state.mod_name,
        description: this.state.mod_description
      }),
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    })

    if (response.status !== 204) {
      // TODO:
      throw new Error("Failed!");
    }
    this.commit();
  }

  commit(): void {
    const { mod_name, mod_description } = this.state;

    this.props.update(mod_name, mod_description)

    this.setState({
      editing: false
    })
  }

  cancel(): void {
    this.setState({
      editing: false
    })
  }

  edit(): void {
    this.setState({
      editing: true
    })
  }

  render(): ReactElement {
    const state = this.state;
    const editing = state.editing;
    const details = this.props.details;

    return <div>
      <FormView
        submit={async () => await this.submit()}
        edit={() => this.edit()}
        cancel={() => this.cancel()}
        editing={editing}
      >
      <dl className="inline">
        <dt>Id</dt>
        <dd>
          {details.id}
        </dd>
        <dt>Created at:</dt>
        <dd>
          {formatDate(details.creationTime)}
        </dd>
        <dt>Name</dt>
        <dd>
          {editing
          ?
          <TextField
            name="mod_name"
            variant="outlined"
            required
            autoFocus
            fullWidth
            autoComplete="off"
            value={state.mod_name}
            onChange={changeHandler.bind(this)}
          />
          :
          <span>{details.name}</span>
          }
        </dd>
        <dt>Description</dt>
        <dd>
        {editing
          ?
          <TextField
            name="mod_description"
            variant="outlined"
            fullWidth
            autoComplete="off"
            multiline
            rows={2}
            rowsMax={4}
            value={state.mod_description}
            onChange={changeHandler.bind(this)}
          />
          :
          <span>{details.description}</span>
        }
        </dd>
      </dl>
      </FormView>
      <div className="versions-region region">
        <h2>Versions</h2>
        <VersionsTable items={details.versions} />
      </div>
    </div>
  }
}
