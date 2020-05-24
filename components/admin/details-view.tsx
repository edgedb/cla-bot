import { ErrorProps } from "../common/error";
import { Component, ReactElement } from "react";
import Panel from "../common/panel";


export interface DetailsViewProps {
  fetchData: () => Promise<void>
}

export interface DetailsViewState {
  error?: ErrorProps
  loading: boolean
}


export class DetailsView
extends Component<DetailsViewProps, DetailsViewState> {

  constructor(props: DetailsViewProps) {
    super(props)

    this.state = {
      error: undefined,
      loading: true
    };
  }

  load(): void {
    if (this.state.error) {
      this.setState({
        loading: true,
        error: undefined
      })
    }

    this.props.fetchData().then(() => {
      this.setState({
        loading: false
      })
    }, () => {
      this.handleError();
    }).catch(reason => {
      this.handleError();
    });
  }

  handleError(): void {
    this.setState({
      loading: false,
      error: {
        retry: () => {
          this.load();
        },
        dismiss: () => this.setState({error: undefined})
      }
    })
  }

  render(): ReactElement {
    const state = this.state;
    return (
      <Panel
        error={state.error}
        load={() => this.load()}
        loading={state.loading}
      >
        {this.props.children}
      </Panel>
    )
  }
}
