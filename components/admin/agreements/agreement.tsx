import { patch } from "../../fetch";
import { Component, ReactElement } from "react";
import { VersionsTable } from "./versions-table";
import { TextField } from "@material-ui/core";
import FormView from "../../common/form-view";
import { AgreementDetails, AgreementVersion } from "./contracts";
import { changeHandler } from "../../forms";
import formatDate from "../../format-date";
import { Version } from "./version";


export interface AgreementDetailsProps {
  onUpdate: (name: string, description: string) => void
  onNewVersion: () => void
  onCompleted: (version: AgreementVersion) => void
  onMakeCurrent: (version: AgreementVersion) => void
  details: AgreementDetails
}


export interface AgreementDetailsState {
  mod_name: string
  mod_description: string
  editing: boolean
  selectedVersion?: AgreementVersion
}


export class AgreementView
extends Component<AgreementDetailsProps, AgreementDetailsState> {

  constructor(props: AgreementDetailsProps) {
    super(props);

    const details = props.details
    this.state = {
      mod_name: details.name,
      mod_description: details.description,
      editing: false,
      selectedVersion: details.versions[0]
    }
  }

  toggleEdit(): void {
    this.setState({
      editing: !this.state.editing
    })
  }

  async update(): Promise<void> {
    const id = this.props.details.id;

    // TODO: add ETAG to entity, verify if ETAG matches on the server
    await patch(`/api/agreements/${id}`, {
      name: this.state.mod_name,
      description: this.state.mod_description
    })

    this.commit();
  }

  commit(): void {
    const { mod_name, mod_description } = this.state;

    this.props.onUpdate(mod_name, mod_description)

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

  selectVersion(version: AgreementVersion): void {
    this.setState({
      selectedVersion: version
    })
  }

  render(): ReactElement {
    const state = this.state;
    const editing = state.editing;
    const details = this.props.details;

    return <div>
      <FormView
        submit={async () => await this.update()}
        edit={() => this.edit()}
        cancel={() => this.cancel()}
        editing={editing}
        className="flex"
      >
        <dl className="inline">
          <dt>Id</dt>
          <dd>
            {details.id}
          </dd>
          <dt>Created at</dt>
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
        <VersionsTable
          items={details.versions}
          selectedItem={state.selectedVersion}
          onRowClick={(version) => this.selectVersion(version)}
        />
      </div>
      {state.selectedVersion !== undefined &&
        <div className="version-region region">
          <Version
            details={state.selectedVersion}
            onNewVersion={this.props.onNewVersion.bind(this)}
            onCompleted={this.props.onCompleted.bind(this)}
            onMakeCurrent={this.props.onMakeCurrent.bind(this)}
          />
        </div>
       }
    </div>
  }
}
