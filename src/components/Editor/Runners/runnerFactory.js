import PythonRunner from './PythonRunner/PythonRunner';
import HtmlRunner from './HtmlRunner/HtmlRunner';

const runnerFactory = (projectType) => {
  const Runner = () => {
    if (projectType === 'html') {
      return HtmlRunner;
    }
    return PythonRunner;
  }

  const Selected = Runner();

  return () => {
    return <Selected />
  }
}

export default runnerFactory;
