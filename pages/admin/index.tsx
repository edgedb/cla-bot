import Layout from "../../components/admin/layout";
import Paper from "@material-ui/core/Paper";
import FormView from "../../components/common/form-view";
import { ReactElement, Component } from "react";
import { changeHandler } from "../../components/forms"
import { TextField } from "@material-ui/core";


interface DashboardState {
  name: string
  description: string
  modName: string
  modDescription: string
  editing: boolean
}


export default class DashboardView
extends Component<{}, DashboardState> {

  constructor(props: {}) {
    super(props)

    this.state = {
      name: "Hello",
      description: "World",
      modName: "",
      modDescription: "",
      editing: false
    }
  }

  async submit(): Promise<void> {
    return new Promise((resolve, reject) => setTimeout(() => {

      // TODO: post changes to the server,
      // upon successful update, refresh th
      reject()
      return
      this.setState({
        name: this.state.modName,
        description: this.state.modDescription,
        editing: false
      })
    }, 500));
  }

  cancel(): void {
    this.setState({
      editing: false
    })
  }

  edit(): void {
    this.setState({
      modName: this.state.name,
      modDescription: this.state.description,
      editing: true
    })
  }

  render(): ReactElement {
    const state = this.state;
    return (
    <Layout title="Dashboard">
      <FormView
        submit={async () => await this.submit()}
        edit={() => this.edit()}
        cancel={() => this.cancel()}
        editing={state.editing}
      >
        <Paper>
          {state.editing
          ?
          <TextField
            name="modName"
            variant="outlined"
            required
            fullWidth
            id="name"
            autoFocus
            autoComplete="off"
            value={state.modName}
            onChange={changeHandler.bind(this)}
          />
          : <p>{state.name}</p>
          }
        </Paper>
        <Paper>
          {state.editing
          ?
          <TextField
            name="modDescription"
            variant="outlined"
            required
            fullWidth
            id="description"
            autoComplete="off"
            value={state.modDescription}
            onChange={changeHandler.bind(this)}
          />
          : <p>{state.description}</p>
          }
        </Paper>
      </FormView>
    </Layout>
    )
  }
}
