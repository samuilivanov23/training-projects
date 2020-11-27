import '../App.css';
import JsonRpcClient from '../../node_modules/react-jsonrpc-client/jsonrpcclient';

function SortFilter(props){

    const FilterProducts = (event) => {
        const filter = event.target.value;

        const django_rpc = new JsonRpcClient({
            endpoint: "http://127.0.0.1:8000/shop/rpc/filters",
        });

        django_rpc.request(
            'FilterProducts',
            filter,
        ).then(function(response){
            response = JSON.parse(response);

            alert(response['msg']);
        }).catch(function(error){
            alert(error['msg']);
        });

        alert(filter);
        console.log(props);
        alert(props.per_page);
    }


    const GenerateSortFilters = () => {
        const options = []

        options.push(<option key={1} value={'Sort by name asc'}> Sort by name (asc)</option>);
        options.push(<option key={2} value={'Sort by name desc'}> Sort by name (desc)</option>);
        options.push(<option key={3} value={'Sort by price asc'}> Sort by price (asc)</option>);
        options.push(<option key={4} value={'Sort by price desc'}> Sort by price (desc)</option>);
        
        return options;
    }

    const options = GenerateSortFilters();
    
    return(
        <div className={'sort-filter'}>
            <select id="SortFilter" name={'sort_filter'} value={'Sorted by name (asc)'} onChange={FilterProducts}>
                {options}
            </select>
            <label style={{marginLeft:'1em'}}>Select filter</label>
        </div>
    );
}

export default SortFilter;