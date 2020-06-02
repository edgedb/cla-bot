import Layout from "./layout";
import Select from "@material-ui/core/Select";
import { Component, ReactElement } from "react";
import { MenuItem } from "@material-ui/core";


const DatesCulturePreferenceKey = "DATES_CULTURE";

const SupportedCultures = "en-us en-gb".split(/\s/g);


interface Preferences {
  datesCulture: string
}

// Basic, simple preferences page to handle date formats, using localStorage.
export default class PreferencesPage extends Component<unknown, Preferences> {

  constructor(props: unknown) {
    super(props);

    this.state = {
      datesCulture: ""
    }
  }

  onCultureSelect(event: React.ChangeEvent<{ value: unknown }>): void {
    const value = event.target.value as string;

    localStorage.setItem(DatesCulturePreferenceKey, value);

    this.setState({
      datesCulture: value
    });
  }

  readInitialValues(): Preferences {
    return {
      datesCulture: localStorage.getItem(DatesCulturePreferenceKey) || "en-us"
    };
  }

  componentDidMount(): void {
    this.setState(this.readInitialValues());
  };

  render(): ReactElement {
    const { datesCulture } = this.state;

    return (
      <Layout title="Preferences">
        <dl className="inline">
          <dt>Dates format</dt>
          <dd>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={datesCulture}
              onChange={this.onCultureSelect.bind(this)}
            >
              {
              SupportedCultures.map(item => {
                return <MenuItem key={item} value={item}>{item}</MenuItem>
              })
              }
            </Select>
          </dd>
        </dl>
      </Layout>
    );
  }
}
